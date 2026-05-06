import React, { useState, useEffect } from 'react';
import { login, logout, isAuthenticated } from '../utils/auth';

export const AuthTest = () => {
    const [authStatus, setAuthStatus] = useState<string>('Checking...');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const isAuth = isAuthenticated();
        setAuthStatus(isAuth ? 'Authenticated' : 'Not Authenticated');
    };

    const handleLogin = async () => {
        const result = await login(username, password);
        checkAuth();
        alert(result.success ? 'Login successful!' : result.message || 'Login failed!');
    };

    const handleLogout = () => {
        logout();
        checkAuth();
    };

    const handleClearStorage = () => {
        localStorage.clear();
        checkAuth();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

                <div className="mb-4">
                    <p className="text-lg">
                        Status: <span className={authStatus === 'Authenticated' ? 'text-green-600' : 'text-red-600'}>
                            {authStatus}
                        </span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="afriland2026"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                        Login
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>

                    <button
                        onClick={handleClearStorage}
                        className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                    >
                        Clear Storage
                    </button>

                    <button
                        onClick={checkAuth}
                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                    >
                        Check Auth Status
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h2 className="text-lg font-semibold mb-2">LocalStorage Contents:</h2>
                    <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(localStorage, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};