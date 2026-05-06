import React, { useState, useEffect } from 'react';
import { isAuthenticated, logout } from '../utils/auth';
import { getAdmins } from '../utils/persistence';


export const AuthDebug = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [localStorageContent, setLocalStorageContent] = useState<any>({});
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setAuthStatus(isAuthenticated() ? 'Authenticated' : 'Not Authenticated');
    setLocalStorageContent({
      'afriland_admin_auth': localStorage.getItem('afriland_admin_auth'),
      'afriland_admins': localStorage.getItem('afriland_admins'),
      'afriland_session_token': localStorage.getItem('afriland_session_token'),
      'afriland_survey_current': localStorage.getItem('afriland_survey_current'),
      'afriland_survey_responses': localStorage.getItem('afriland_survey_responses'),
    });
    setAdmins(await getAdmins());
  };

  const handleClearAuth = () => {
    logout();
    checkStatus();
    alert('Auth cleared!');
  };

  const handleClearAll = () => {
    localStorage.clear();
    checkStatus();
    alert('All storage cleared!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Authentication Debug Panel</h1>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${authStatus === 'Authenticated' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-lg font-medium">{authStatus}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={checkStatus}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Refresh Status
            </button>
            <button
              onClick={handleClearAuth}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Clear Auth Only
            </button>
            <button
              onClick={handleClearAll}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Clear All Storage
            </button>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Registered Admins ({admins.length})</h2>
          {admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p><strong>Name:</strong> {admin.name}</p>
                  <p><strong>Username:</strong> {admin.username}</p>
                  <p><strong>ID:</strong> {admin.id}</p>
                  <p><strong>Created:</strong> {new Date(admin.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No admins found</p>
          )}
        </div>

        {/* LocalStorage Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Content</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(localStorageContent, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">🔧 Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Check if you see "Authenticated" status above</li>
            <li>If "Authenticated" but shouldn't be, click "Clear Auth Only"</li>
            <li>If still having issues, click "Clear All Storage"</li>
            <li>Then login again at <code className="bg-blue-100 px-2 py-1 rounded">/#/creer</code> or <code className="bg-blue-100 px-2 py-1 rounded">/#/resultats</code></li>
            <li>Check the "Registered Admins" section to verify admin accounts</li>
          </ol>
        </div>
      </div>
    </div>
  );
};