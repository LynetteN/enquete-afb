// API Client for Backend Communication
// This handles all HTTP requests to backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  // Token management
  private loadToken(): void {
    this.token = localStorage.getItem('afriland_admin_token');
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('afriland_admin_token', token);
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('afriland_admin_token');
  }

  setToken(token: string): void {
    this.saveToken(token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearAuth(): void {
    this.clearToken();
  }

  // HTTP helper methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  private put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(username: string, password: string) {
    const response = await this.post<{
      success: boolean;
      data: { token: string; admin: any };
    }>('/admin/login', { username, password });

    if (response.success && response.data) {
      this.saveToken(response.data.token);
      return response.data;
    }

    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  // Admin methods
  async getAdmins() {
    return this.get<{ success: boolean; data: any[] }>('/admin');
  }

  async createAdmin(username: string, password: string, name: string) {
    return this.post('/admin', { username, password, name });
  }

  async deleteAdmin(adminId: string) {
    return this.delete(`/admin/${adminId}`);
  }

  async updateAdminPassword(adminId: string, newPassword: string) {
    return this.put(`/admin/${adminId}/password`, { newPassword });
  }

  async getStats() {
    return this.get('/admin/stats/overview');
  }

  // Survey methods
  async getSurveys() {
    return this.get<{ success: boolean; data: any[] }>('/surveys');
  }

  async getSurveyById(id: number) {
    return this.get(`/surveys/${id}`);
  }

  async getLatestSurvey() {
    return this.get('/surveys/latest');
  }

  async createSurvey(surveyData: any) {
    return this.post('/surveys', surveyData);
  }

  async updateSurvey(id: number, surveyData: any) {
    return this.put(`/surveys/${id}`, surveyData);
  }

  async deleteSurvey(id: number) {
    return this.delete(`/surveys/${id}`);
  }

  // Response methods
  async getResponses() {
    return this.get<{ success: boolean; data: any[] }>('/responses');
  }

  async getResponsesBySurvey(surveyId: string) {
    return this.get(`/responses/survey/${surveyId}`);
  }

  async getResponseById(id: number) {
    return this.get(`/responses/${id}`);
  }

  async createResponse(responseData: any) {
    return this.post('/responses', responseData);
  }

  async hasUserResponded(surveyId: string, sessionToken: string) {
    return this.get(`/responses/check/${surveyId}?session_token=${sessionToken}`);
  }

  async deleteResponse(id: number) {
    return this.delete(`/responses/${id}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;