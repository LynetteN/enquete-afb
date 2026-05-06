import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SurveyEditor } from './pages/SurveyEditor';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { SurveyResponse } from './pages/SurveyResponse';
import { AdminManagement } from './pages/AdminManagement';
import { AuthDebug } from './pages/AuthDebug';
import { Diagnostics } from './pages/Diagnostics';
import { envConfig } from './config/environment';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="repondre" element={<SurveyResponse />} />
                    <Route path="creer" element={<SurveyEditor />} />
                    <Route path="resultats" element={<ResultsDashboard />} />
                    <Route path="admin" element={<AdminManagement />} />
                    <Route path="debug-auth" element={<AuthDebug />} />
                    {envConfig.enableDiagnostics && (
                        <Route path="diagnostics" element={<Diagnostics />} />
                    )}
                </Route>
                {/* Fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

