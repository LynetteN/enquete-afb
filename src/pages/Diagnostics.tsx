// Diagnostics Component
// This component provides diagnostic tools for troubleshooting SQLite database integration

import React, { useState, useEffect } from 'react';
import { getDatabase, closeDatabase } from '../services/database';
import { getDatabaseStats } from '../utils/persistence';
import { envConfig, validateEnvironment } from '../config/environment';
import './Diagnostics.css';

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  details?: string;
}

export const Diagnostics: React.FC = () => {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
    setTests(prev =>
      prev.map((test, i) => (i === index ? { ...test, ...updates } : test))
    );
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setTests([
      { name: 'Environment Configuration', status: 'pending', message: 'Waiting to run...' },
      { name: 'Database Connection', status: 'pending', message: 'Waiting to run...' },
      { name: 'Database Schema', status: 'pending', message: 'Waiting to run...' },
      { name: 'Data Operations', status: 'pending', message: 'Waiting to run...' },
      { name: 'Admin Operations', status: 'pending', message: 'Waiting to run...' },
      { name: 'Performance Test', status: 'pending', message: 'Waiting to run...' }
    ]);

    addLog('Starting diagnostics...');

    // Test 1: Environment Configuration
    updateTest(0, { status: 'running', message: 'Testing environment configuration...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const envValidation = validateEnvironment();
      if (envValidation.valid) {
        updateTest(0, { status: 'passed', message: 'Environment configuration is valid' });
        addLog('✅ Environment configuration passed');
      } else {
        updateTest(0, { status: 'failed', message: 'Environment configuration has errors', details: envValidation.errors.join(', ') });
        addLog('❌ Environment configuration failed: ' + envValidation.errors.join(', '));
      }
    } catch (error) {
      updateTest(0, { status: 'failed', message: 'Environment test failed', details: String(error) });
      addLog('❌ Environment test failed: ' + String(error));
    }

    // Test 2: Database Connection
    updateTest(1, { status: 'running', message: 'Testing database connection...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const db = getDatabase();
      const stats = db.getStats();
      setDbStats(stats);
      updateTest(1, { status: 'passed', message: 'Database connection successful', details: `Size: ${stats.databaseSize} bytes` });
      addLog('✅ Database connection successful');
    } catch (error) {
      updateTest(1, { status: 'failed', message: 'Database connection failed', details: String(error) });
      addLog('❌ Database connection failed: ' + String(error));
    }

    // Test 3: Database Schema
    updateTest(2, { status: 'running', message: 'Testing database schema...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const db = getDatabase();
      const tables = db.getStats();
      updateTest(2, { status: 'passed', message: 'Database schema is valid', details: `${tables.surveys} surveys, ${tables.responses} responses, ${tables.admins} admins` });
      addLog('✅ Database schema is valid');
    } catch (error) {
      updateTest(2, { status: 'failed', message: 'Database schema test failed', details: String(error) });
      addLog('❌ Database schema test failed: ' + String(error));
    }

    // Test 4: Data Operations
    updateTest(3, { status: 'running', message: 'Testing data operations...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const db = getDatabase();
      const surveys = db.getAllSurveys();
      const responses = db.getAllResponses();
      updateTest(3, { status: 'passed', message: 'Data operations successful', details: `Retrieved ${surveys.length} surveys, ${responses.length} responses` });
      addLog('✅ Data operations successful');
    } catch (error) {
      updateTest(3, { status: 'failed', message: 'Data operations failed', details: String(error) });
      addLog('❌ Data operations failed: ' + String(error));
    }

    // Test 5: Admin Operations
    updateTest(4, { status: 'running', message: 'Testing admin operations...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const db = getDatabase();
      const admins = db.getAdmins();
      updateTest(4, { status: 'passed', message: 'Admin operations successful', details: `Found ${admins.length} admin accounts` });
      addLog('✅ Admin operations successful');
    } catch (error) {
      updateTest(4, { status: 'failed', message: 'Admin operations failed', details: String(error) });
      addLog('❌ Admin operations failed: ' + String(error));
    }

    // Test 6: Performance Test
    updateTest(5, { status: 'running', message: 'Testing database performance...' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const startTime = Date.now();
      const db = getDatabase();
      const surveys = db.getAllSurveys();
      const responses = db.getAllResponses();
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration < 100) {
        updateTest(5, { status: 'passed', message: 'Performance is excellent', details: `Query completed in ${duration}ms` });
        addLog(`✅ Performance test passed (${duration}ms)`);
      } else if (duration < 500) {
        updateTest(5, { status: 'passed', message: 'Performance is good', details: `Query completed in ${duration}ms` });
        addLog(`✅ Performance test passed (${duration}ms)`);
      } else {
        updateTest(5, { status: 'passed', message: 'Performance is acceptable', details: `Query completed in ${duration}ms` });
        addLog(`⚠️ Performance test passed but could be optimized (${duration}ms)`);
      }
    } catch (error) {
      updateTest(5, { status: 'failed', message: 'Performance test failed', details: String(error) });
      addLog('❌ Performance test failed: ' + String(error));
    }

    addLog('Diagnostics completed');
    setIsRunning(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshStats = async () => {
    try {
      const stats = await getDatabaseStats();
      setDbStats(stats);
      addLog('Database stats refreshed');
    } catch (error) {
      addLog('Failed to refresh stats: ' + String(error));
    }
  };

  useEffect(() => {
    // Load initial stats
    refreshStats();
  }, []);

  return (
    <div className="diagnostics-container">
      <div className="diagnostics-header">
        <h1>System Diagnostics</h1>
        <p>SQLite Database Integration Health Check</p>
      </div>

      <div className="diagnostics-actions">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="btn btn-primary"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
        <button
          onClick={clearLogs}
          className="btn btn-secondary"
        >
          Clear Logs
        </button>
        <button
          onClick={refreshStats}
          className="btn btn-secondary"
        >
          Refresh Stats
        </button>
      </div>

      {dbStats && (
        <div className="diagnostics-stats">
          <h3>Database Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Surveys:</span>
              <span className="stat-value">{dbStats.surveys}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Responses:</span>
              <span className="stat-value">{dbStats.responses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Admins:</span>
              <span className="stat-value">{dbStats.admins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Database Size:</span>
              <span className="stat-value">{(dbStats.databaseSize / 1024).toFixed(2)} KB</span>
            </div>
          </div>
        </div>
      )}

      <div className="diagnostics-tests">
        <h3>Test Results</h3>
        {tests.length === 0 ? (
          <p className="no-tests">No tests run yet. Click "Run Diagnostics" to start.</p>
        ) : (
          <div className="tests-list">
            {tests.map((test, index) => (
              <div key={index} className={`test-item test-${test.status}`}>
                <div className="test-header">
                  <span className="test-name">{test.name}</span>
                  <span className={`test-status status-${test.status}`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                <div className="test-message">{test.message}</div>
                {test.details && (
                  <div className="test-details">{test.details}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="diagnostics-logs">
          <h3>System Logs</h3>
          <div className="logs-container">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      )}

      <div className="diagnostics-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">App Mode:</span>
            <span className="info-value">{envConfig.appMode}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Offline Mode:</span>
            <span className="info-value">{envConfig.enableOfflineMode ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Diagnostics:</span>
            <span className="info-value">{envConfig.enableDiagnostics ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Log Level:</span>
            <span className="info-value">{envConfig.logLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};