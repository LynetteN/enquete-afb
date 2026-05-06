// Environment Configuration
// This file handles environment variables and provides type-safe access

export interface EnvironmentConfig {
  // Application Configuration
  appMode: 'development' | 'staging' | 'production';
  apiBaseUrl: string;

  // Feature Flags
  enableOfflineMode: boolean;
  enableDiagnostics: boolean;

  // Security
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableConsoleLogging: boolean;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key, defaultValue.toString());
  return value.toLowerCase() === 'true' || value === '1';
};

export const envConfig: EnvironmentConfig = {
  // Application Configuration
  appMode: (getEnvVar('VITE_APP_MODE', 'development') as 'development' | 'staging' | 'production'),
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),

  // Feature Flags
  enableOfflineMode: getEnvBool('VITE_ENABLE_OFFLINE_MODE', true),
  enableDiagnostics: getEnvBool('VITE_ENABLE_DIAGNOSTICS', false),

  // Security
  enableRateLimiting: getEnvBool('VITE_ENABLE_RATE_LIMITING', true),
  maxRequestsPerMinute: parseInt(getEnvVar('VITE_MAX_REQUESTS_PER_MINUTE', '60')),

  // Logging
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
  enableConsoleLogging: getEnvBool('VITE_ENABLE_CONSOLE_LOGGING', true)
};

// Validation helper
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // No required environment variables for local storage mode
  return {
    valid: errors.length === 0,
    errors
  };
};

// Development mode check
export const isDevelopment = (): boolean => {
  return envConfig.appMode === 'development';
};

// Production mode check
export const isProduction = (): boolean => {
  return envConfig.appMode === 'production';
};