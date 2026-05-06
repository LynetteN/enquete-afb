import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Shield, Key, UserPlus, AlertCircle, CheckCircle2, X, LogOut } from 'lucide-react';
import { getCurrentAdmin, isAuthenticated, logout, AdminUser } from '../utils/auth';
import { getAdmins, addAdmin, deleteAdmin, updateAdminPassword } from '../utils/persistence';
import { AdminLogin } from '../components/AdminLogin';

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // New admin form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password change form
  const [changePassword, setChangePassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const authData = localStorage.getItem('afriland_admin_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        const isExpired = Date.now() - auth.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && auth.isAuthenticated) {
          setIsAuthenticated(true);
          loadAdmins();
          setCurrentAdmin(getCurrentAdmin());
        } else {
          setShowLoginModal(true);
        }
      } catch {
        setShowLoginModal(true);
      }
    } else {
      setShowLoginModal(true);
    }
  }, []);

  const loadAdmins = async () => {
    const adminList = await getAdmins();
    setAdmins(adminList);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    loadAdmins();
    setCurrentAdmin(getCurrentAdmin());
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setShowLoginModal(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      showMessage('error', 'Tous les champs sont obligatoires');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await addAdmin(newUsername, newPassword, newName);
      showMessage('success', 'Administrateur ajouté avec succès');
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setShowAddModal(false);
      loadAdmins();
    } catch (error) {
      showMessage('error', 'Ce nom d\'utilisateur existe déjà ou erreur lors de l\'ajout');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      const success = await deleteAdmin(adminId);
      if (success) {
        showMessage('success', 'Administrateur supprimé avec succès');
        loadAdmins();
      } else {
        showMessage('error', 'Impossible de supprimer cet administrateur');
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!changePassword.trim() || changePassword.length < 6) {
      showMessage('error', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (selectedAdmin) {
      const success = await updateAdminPassword(selectedAdmin.id, changePassword);
      if (success) {
        showMessage('success', 'Mot de passe modifié avec succès');
        setChangePassword('');
        setShowPasswordModal(false);
        setSelectedAdmin(null);
      } else {
        showMessage('error', 'Impossible de modifier le mot de passe');
      }
    }
  };

  const openPasswordModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setChangePassword('');
    setShowPasswordModal(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Chargement de la gestion des administrateurs...</p>
          {showLoginModal && (
            <AdminLogin
              onSuccess={handleLoginSuccess}
              onCancel={() => window.location.hash = '#/'}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E2001A] to-[#FFD700] rounded-xl flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Gestion des Administrateurs</h1>
                <p className="text-gray-500 text-sm">Gérez les accès au panneau d'administration</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield size={16} />
            <span>Connecté en tant que: <strong className="text-gray-700">{currentAdmin?.name || 'Administrateur'}</strong></span>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Total Administrateurs</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{admins.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-green-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Comptes Actifs</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{admins.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Key size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Dernière Création</span>
            </div>
            <p className="text-lg font-black text-gray-900">
              {admins.length > 0 ? new Date(admins[admins.length - 1].createdAt).toLocaleDateString('fr-FR') : '-'}
            </p>
          </div>
        </div>

        {/* Add Admin Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#E2001A] to-[#FFD700] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <UserPlus size={20} />
            Ajouter un Administrateur
          </button>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Liste des Administrateurs</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {admins.map((admin, index) => (
              <div
                key={admin.id}
                className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-black text-gray-600">
                      {admin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-500">@{admin.username}</p>
                  </div>
                  {admin.id === currentAdmin?.id && (
                    <span className="px-3 py-1 bg-[#E2001A] text-white text-xs font-bold rounded-full">
                      Vous
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPasswordModal(admin)}
                    className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                    title="Modifier le mot de passe"
                  >
                    <Key size={18} />
                  </button>
                  {admin.id !== currentAdmin?.id && admins.length > 1 && (
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {admins.length === 0 && (
              <div className="p-12 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun administrateur trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E2001A] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserPlus size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Ajouter un Administrateur</h2>
                <p className="text-gray-500 text-sm">Créez un nouveau compte administrateur</p>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="jdupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all pr-12"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showNewPassword ? <X size={18} className="text-gray-400" /> : <Key size={18} className="text-gray-400" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#E2001A] to-[#FFD700] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Créer l'administrateur
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Key size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Modifier le Mot de Passe</h2>
                <p className="text-gray-500 text-sm">Pour {selectedAdmin.name}</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showChangePassword ? 'text' : 'password'}
                      value={changePassword}
                      onChange={(e) => setChangePassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E2001A] focus:ring-2 focus:ring-red-100 outline-none transition-all pr-12"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showChangePassword ? <X size={18} className="text-gray-400" /> : <Key size={18} className="text-gray-400" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Modifier le mot de passe
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => window.location.hash = '#/'}
        />
      )}
    </div>
  );
};