// Database Models

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  categories: string[];
  version: string;
  last_updated: Date;
  updated_by: string;
  created_at: Date;
  published_at?: Date;
}

export interface Question {
  id: number;
  text: string;
  type: 'text' | 'choice' | 'rating';
  required: boolean;
  category: string;
  options?: string[];
}

export interface SurveyResponse {
  id: number;
  survey_id: string;
  session_token: string;
  answers: Record<string, any>;
  timestamp: Date;
  is_admin: boolean;
  synced_at: Date;
  created_at: Date;
}

// API Request/Response Types

export interface CreateSurveyRequest {
  title: string;
  description: string;
  questions: Question[];
  categories: string[];
}

export interface CreateResponseRequest {
  survey_id: string;
  answers: Record<string, any>;
  session_token: string;
  is_admin?: boolean;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  admin: Omit<Admin, 'password'>;
}

// Database Query Results

export interface SurveyRow {
  id: number;
  title: string;
  description: string;
  questions: string;
  categories: string;
  version: string;
  last_updated: Date;
  updated_by: string;
  created_at: Date;
  published_at: Date | null;
}

export interface ResponseRow {
  id: number;
  survey_id: string;
  session_token: string;
  answers: string;
  timestamp: Date;
  is_admin: boolean;
  synced_at: Date;
  created_at: Date;
}

export interface AdminRow {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
