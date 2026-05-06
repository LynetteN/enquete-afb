// TypeScript Type Definitions
// This file contains all type definitions used across the application

// Survey Types
export interface Survey {
  id?: number;
  title: string;
  description: string;
  questions: Question[];
  categories: string[];
  version: string;
  lastUpdated: string;
  updatedBy: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Question {
  id: number;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'dropdown' | 'rating' | 'date';
  text: string;
  required: boolean;
  category: string;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// Response Types
export interface SurveyResponse {
  id: number;
  surveyId: string;
  answers: Record<string, any>;
  sessionToken: string;
  timestamp: string;
  isAdmin: boolean;
  syncedAt?: string;
}

export interface Answer {
  questionId: string;
  value: any;
  timestamp: string;
}

// Database Types
export interface DatabaseStats {
  surveys: number;
  responses: number;
  admins: number;
  databaseSize: number;
}

// Authentication Types
export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface AdminAuth {
  isAuthenticated: boolean;
  adminId: string;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean | string;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  recentResponses: number;
  averageCompletionRate: number;
}

export interface ResponseAnalytics {
  surveyId: string;
  totalResponses: number;
  responsesByDate: Record<string, number>;
  questionStats: Record<string, {
    totalAnswers: number;
    answerDistribution: Record<string, number>;
    averageValue?: number;
  }>;
}

// Configuration Types
export interface AppConfig {
  appMode: 'development' | 'staging' | 'production';
  enableOfflineMode: boolean;
  enableDiagnostics: boolean;
  apiBaseUrl: string;
}

export interface DatabaseConfig {
  dbPath: string;
  backupPath: string;
  enableAutoBackup: boolean;
  backupIntervalHours: number;
}

// Error Types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  userFriendlyMessage: string;
  retryable: boolean;
}

// UI Component Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export interface InputProps {
  name: string;
  label?: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

// Utility Types
export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event Types
export interface DatabaseEvent {
  type: 'connected' | 'disconnected' | 'backup-created' | 'error';
  timestamp: Date;
  details?: any;
}

// Export all types
export type {
  Survey,
  Question,
  SurveyResponse,
  Answer,
  DatabaseStats,
  AdminUser,
  AdminAuth,
  ApiResponse,
  PaginatedResponse,
  FormField,
  FormState,
  DashboardStats,
  ResponseAnalytics,
  AppConfig,
  DatabaseConfig,
  AppError,
  ButtonProps,
  InputProps,
  ModalProps,
  ToastProps,
  DatabaseEvent
};