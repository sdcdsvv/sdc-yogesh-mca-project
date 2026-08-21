import { apiClient, API_ENDPOINTS } from '../config/api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  department?: string;
  year?: string;
  semester?: string;
  designation?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const settingsAPI = {
  // Update user profile
  updateProfile: async (userId: string, data: UpdateProfileData) => {
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.USERS.BY_ID(userId), data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};
