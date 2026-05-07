import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login, isLockedOut, getLockoutTimeRemaining, getRemainingAttempts } from '../utils/auth';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  useEffect(() => {
    // Update lockout time every second
    const interval = setInterval(() => {
      if (isLockedOut()) {
        setLockoutTime(getLockoutTimeRemaining());
      } else {
        setLockoutTime(0);
      }
      setRemainingAttempts(getRemainingAttempts());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('AdminLogin - Attempting login with:', { username });

    try {
      const result = await login(username, password);
      console.log('AdminLogin - Login result:', result);

      if (result.success) {
        console.log('AdminLogin - Login successful, calling onSuccess');
        onSuccess();
      } else {
        console.log('AdminLogin - Login failed');
        setError(result.message || 'Identifiants incorrects');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('AdminLogin - Login error:', error);
      setError('Erreur lors de la connexion');
      setIsLoading(false);
    }
  };

  const isCurrentlyLockedOut = isLockedOut();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E2001A] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Accès Admin</h2>
          <p className="text-gray-500 text-sm">Entrez vos identifiants pour accéder au panneau d'administration</p>
        </div>

        {isCurrentlyLockedOut && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600 mb-6"
          >
            <AlertCircle size={20} />
            <div>
              <p className="font-bold">Compte verrouillé</p>
              <p className="text-sm">Trop de tentatives échouées. Réessayez dans {lockoutTime} secondes.</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all"
                placeholder="Votre nom d'utilisateur"
                required
                disabled={isCurrentlyLockedOut}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all pr-12"
                placeholder="••••••••"
                required
                disabled={isCurrentlyLockedOut}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {error && !isCurrentlyLockedOut && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm"
            >
              <Lock size={16} />
              {error}
            </motion.div>
          )}

          {!isCurrentlyLockedOut && (
            <div className="text-xs text-gray-400 text-center">
              {remainingAttempts} tentative(s) restante(s)
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isCurrentlyLockedOut}
            className="w-full bg-gradient-to-r from-[#E2001A] to-[#FFD700] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion...' : isCurrentlyLockedOut ? 'Verrouillé' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            <Lock size={12} className="inline mr-1" />
            Accès réservé au personnel autorisé
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};