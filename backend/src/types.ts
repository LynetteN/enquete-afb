// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin Types
export interface Admin {
  id: string;
  username: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminRow {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  admin: Omit<Admin, 'password'>;
}

// Survey Types
export interface Survey {
  id: number;
  title: string;
  description?: string;
  questions: any[];
  categories?: any;
  version?: string;
  last_updated: Date;
  updated_by?: string;
  created_at: Date;
  published_at?: Date;
}

export interface SurveyRow {
  id: number;
  title: string;
  description?: string;
  questions: any;
  categories?: any;
  version?: string;
  last_updated: Date;
  updated_by?: string;
  created_at: Date;
  published_at?: Date;
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  questions: any[];
  categories?: any;
  version?: string;
  updated_by?: string;
}

// Response Types
export interface SurveyResponse {
  id: number;
  survey_id: string;
  session_token: string;
  answers: any[];
  timestamp: Date;
  is_admin: boolean;
  synced_at: Date;
  created_at: Date;
}

export interface ResponseRow {
  id: number;
  survey_id: string;
  session_token: string;
  answers: any;
  timestamp: Date;
  is_admin: boolean;
  synced_at: Date;
  created_at: Date;
}

export interface CreateResponseRequest {
  survey_id: string;
  session_token: string;
  answers: any[];
  timestamp?: Date;
  is_admin?: boolean;
}