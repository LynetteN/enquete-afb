// Authentication system integrated with backend API
// Uses JWT tokens for secure authentication

import apiClient from './apiClient';

const AUTH_STORAGE_KEY = 'afriland_admin_auth';
const SESSION_TOKEN_KEY = 'afriland_session_token';
const ADMIN_SESSION_TOKEN_KEY = 'afriland_admin_session_token';
const AUTH_EVENT_NAME = 'auth-state-changed';
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const LOCKOUT_TIME_KEY = 'lockout_time';

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}
// src/utils/auth.ts
export const getAdmins = async (): Promise<string[]> => {
  // your implementation here
  return [];
};
export interface AdminAuth {
  isAuthenticated: boolean;
  adminId: string;
  username: string;
  name: string;
  timestamp: number;
}

// Check if user is locked out
export const isLockedOut = (): boolean => {
  const lockoutTime = localStorage.getItem(LOCKOUT_TIME_KEY);
  if (!lockoutTime) return false;

  const lockoutEndTime = parseInt(lockoutTime);
  const currentTime = Date.now();

  if (currentTime < lockoutEndTime) {
    return true; // Still locked out
  } else {
    // Lockout period has expired, clear it
    localStorage.removeItem(LOCKOUT_TIME_KEY);
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    return false;
  }
};

// Get remaining lockout time in seconds
export const getLockoutTimeRemaining = (): number => {
  const lockoutTime = localStorage.getItem(LOCKOUT_TIME_KEY);
  if (!lockoutTime) return 0;

  const lockoutEndTime = parseInt(lockoutTime);
  const currentTime = Date.now();
  const remaining = Math.ceil((lockoutEndTime - currentTime) / 1000);

  return remaining > 0 ? remaining : 0;
};

// Record failed login attempt
export const recordFailedAttempt = (): void => {
  const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0');
  const newAttempts = attempts + 1;
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, newAttempts.toString());

  // If max attempts reached, lock the account
  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutEndTime = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(LOCKOUT_TIME_KEY, lockoutEndTime.toString());
  }
};

// Clear login attempts on successful login
export const clearLoginAttempts = (): void => {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_TIME_KEY);
};

// Get remaining login attempts
export const getRemainingAttempts = (): number => {
  if (isLockedOut()) return 0;
  const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0');
  return MAX_LOGIN_ATTEMPTS - attempts;
};

export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
  // Check if locked out
  if (isLockedOut()) {
    const remainingTime = getLockoutTimeRemaining();
    return {
      success: false,
      message: `Compte verrouillé. Réessayez dans ${remainingTime} secondes.`
    };
  }

  try {
    const result = await apiClient.login(username, password);

    if (result && result.token && result.admin) {
      const auth: AdminAuth = {
        isAuthenticated: true,
        adminId: result.admin.id,
        username: result.admin.username,
        name: result.admin.name,
        timestamp: Date.now()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));

      // Generate unique admin session token for this admin
      generateAdminSessionToken(result.admin.id);

      // Clear failed attempts on successful login
      clearLoginAttempts();

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAuthenticated: true } }));

      return { success: true };
    } else {
      // Record failed attempt
      recordFailedAttempt();
      const remainingAttempts = getRemainingAttempts();

      return {
        success: false,
        message: remainingAttempts > 0
          ? `Identifiants incorrects. ${remainingAttempts} tentative(s) restante(s).`
          : 'Trop de tentatives. Compte verrouillé pour 15 minutes.'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    // Record failed attempt
    recordFailedAttempt();
    const remainingAttempts = getRemainingAttempts();

    return {
      success: false,
      message: remainingAttempts > 0
        ? `Erreur de connexion. ${remainingAttempts} tentative(s) restante(s).`
        : 'Trop de tentatives. Compte verrouillé pour 15 minutes.'
    };
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
  apiClient.clearAuth();

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAuthenticated: false } }));
};

export const isAuthenticated = (): boolean => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return false;

  try {
    const auth: AdminAuth = JSON.parse(authData);

    // Check if auth has required fields (migration from old format)
    if (!auth.adminId) {
      logout();
      return false;
    }

    // Session expires after 24 hours
    const isExpired = Date.now() - auth.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      logout();
      return false;
    }

    return auth.isAuthenticated;
  } catch {
    logout();
    return false;
  }
};

// Get current admin info
export const getCurrentAdmin = (): AdminUser | null => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return null;

  try {
    const auth: AdminAuth = JSON.parse(authData);
    return {
      id: auth.adminId,
      username: auth.username,
      name: auth.name,
      createdAt: new Date(auth.timestamp).toISOString()
    };
  } catch {
    return null;
  }
};

// Export the event name for components to listen to
export { AUTH_EVENT_NAME };

// Session token management for survey responses
export const generateSessionToken = (): string => {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
};

export const getSessionToken = (): string => {
  return localStorage.getItem(SESSION_TOKEN_KEY) || generateSessionToken();
};

// Admin session token management - each admin gets their own session
export const generateAdminSessionToken = (adminId: string): string => {
  const token = 'admin_session_' + adminId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, token);
  return token;
};

export const getAdminSessionToken = (): string => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (authData) {
    try {
      const auth: AdminAuth = JSON.parse(authData);
      let token = localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
      if (!token || !token.startsWith('admin_session_' + auth.adminId)) {
        token = generateAdminSessionToken(auth.adminId);
      }
      return token;
    } catch {
      return 'admin_session_' + Date.now();
    }
  }
  return 'admin_session_' + Date.now();
};

export const hasRespondedInSession = (surveyId: string): boolean => {
  const token = getSessionToken();
  const responses = JSON.parse(localStorage.getItem('afriland_survey_responses') || '[]');
  return responses.some((r: any) => r.sessionToken === token && r.surveyId === surveyId);
};

export const isAdminSession = (): boolean => {
  return isAuthenticated();
};

export const clearSessionToken = (): void => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
};