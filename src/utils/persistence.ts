import apiClient from './apiClient';
import { getSessionToken, isAdminSession, getAdminSessionToken } from './auth';

// Survey operations
export const saveSurvey = async (surveyData: any) => {
  try {
    const response = await apiClient.createSurvey(surveyData) as { success: boolean; data?: any };

    if (response.success && response.data) {
      // Also keep localStorage for backward compatibility
      localStorage.setItem('afriland_survey_current', JSON.stringify(response.data));
      localStorage.setItem('afriland_survey_timestamp', Date.now().toString());

      return response.data;
    }

    throw new Error('Failed to save survey');
  } catch (error) {
    console.error('Error saving survey:', error);
    throw error;
  }
};

export const getSurvey = async () => {
  try {
    const response = await apiClient.getLatestSurvey() as { success: boolean; data?: any };

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback to localStorage
    const data = localStorage.getItem('afriland_survey_current');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting survey:', error);

    // Fallback to localStorage
    const data = localStorage.getItem('afriland_survey_current');
    return data ? JSON.parse(data) : null;
  }
};

export const getAllSurveys = async () => {
  try {
    const response = await apiClient.getSurveys() as { success: boolean; data?: any[] };

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error getting surveys:', error);
    return [];
  }
};

// Response operations
export const saveResponse = async (response: any) => {
  try {
    // Use appropriate session token based on user type
    const isAdmin = response.is_admin || isAdminSession();
    const sessionToken = isAdmin ? getAdminSessionToken() : getSessionToken();

    const responseWithToken = {
      survey_id: response.survey_id, // Ensure survey_id is included
      session_token: sessionToken,
      answers: response.answers,
      timestamp: response.timestamp || new Date().toISOString(),
      is_admin: isAdmin
    };

    const apiResponse = await apiClient.createResponse(responseWithToken) as { success: boolean; data?: any };

    if (apiResponse.success && apiResponse.data) {
      // Also keep localStorage for backward compatibility
      const existingResponses = getResponsesFromStorage();
      const updatedResponses = [...existingResponses, {
        ...responseWithToken,
        id: apiResponse.data.id,
        syncedAt: apiResponse.data.synced_at
      }];
      localStorage.setItem('afriland_survey_responses', JSON.stringify(updatedResponses));

      return apiResponse.data;
    }

    throw new Error('Failed to save response');
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
};

export const getResponses = async () => {
  try {
    const response = await apiClient.getResponses() as { success: boolean; data?: any[] };

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error getting responses:', error);
    return [];
  }
};

export const getResponsesBySurvey = async (surveyId: string) => {
  try {
    const response = await apiClient.getResponsesBySurvey(surveyId) as { success: boolean; data?: any[] };

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error getting survey responses:', error);
    return [];
  }
};

export const hasUserResponded = async (surveyId: string): Promise<boolean> => {
  try {
    const sessionToken = getSessionToken();
    const response = await apiClient.hasUserResponded(surveyId, sessionToken) as { success: boolean; data?: { hasResponded: boolean } };

    if (response.success && response.data) {
      return response.data.hasResponded;
    }

    return false;
  } catch (error) {
    console.error('Error checking user response:', error);
    return false;
  }
};

export const getResponse = async (id: number) => {
  try {
    const response = await apiClient.getResponseById(id) as { success: boolean; data?: any };

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error getting response:', error);
    return null;
  }
};

export const updateResponse = async (_id: number, _updates: any) => {
  // Note: Update functionality not implemented in backend yet
  // For now, return the response
  return getResponse(_id);
};

export const deleteResponse = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.deleteResponse(id) as { success: boolean };

    if (response.success) {
      // Update localStorage
      const existingResponses = getResponsesFromStorage();
      const updatedResponses = existingResponses.filter((r: any) => r.id !== id);
      localStorage.setItem('afriland_survey_responses', JSON.stringify(updatedResponses));

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting response:', error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    // Clear localStorage
    localStorage.removeItem('afriland_survey_current');
    localStorage.removeItem('afriland_survey_responses');
    localStorage.removeItem('afriland_survey_timestamp');

    // Note: Backend doesn't have a clear all endpoint
    // Individual items would need to be deleted separately
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Admin operations - now handled by backend API
export const getAdmins = async () => {
  try {
    const response = await apiClient.getAdmins() as { success: boolean; data?: any[] };

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error getting admins:', error);
    return [];
  }
};

export const addAdmin = async (username: string, password: string, name: string) => {
  try {
    const response = await apiClient.createAdmin(username, password, name) as { success: boolean; data?: any };

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to create admin');
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (adminId: string) => {
  try {
    const response = await apiClient.deleteAdmin(adminId) as { success: boolean };

    if (response.success) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting admin:', error);
    return false;
  }
};

export const updateAdminPassword = async (adminId: string, newPassword: string) => {
  try {
    const response = await apiClient.updateAdminPassword(adminId, newPassword) as { success: boolean };

    if (response.success) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error updating admin password:', error);
    return false;
  }
};

// Utility functions
export const getDatabaseStats = async () => {
  try {
    const response = await apiClient.getStats() as { success: boolean; data?: any };

    if (response.success && response.data) {
      return response.data;
    }

    return {
      surveys: 0,
      responses: 0,
      admins: 0,
      databaseSize: 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      surveys: 0,
      responses: 0,
      admins: 0,
      databaseSize: 0
    };
  }
};

export const backupDatabase = async () => {
  // Note: Backup functionality would need to be implemented in backend
  // For now, return empty JSON
  return JSON.stringify({ version: 1, exportDate: new Date().toISOString() });
};

export const importDatabase = async (_jsonData: string) => {
  // Note: Import functionality would need to be implemented in backend
  console.warn('Import functionality not yet implemented');
};

// Offline mode helpers
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const getOfflineResponses = async () => {
  // Get responses from localStorage that haven't been synced
  const allResponses = getResponsesFromStorage();
  return allResponses.filter((r: any) => !r.syncedAt);
};

export const getPendingSyncCount = async () => {
  const responses = await getOfflineResponses();
  return responses.length;
};

// Helper function for localStorage fallback
const getResponsesFromStorage = () => {
  const data = localStorage.getItem('afriland_survey_responses');
  return data ? JSON.parse(data) : [];
};