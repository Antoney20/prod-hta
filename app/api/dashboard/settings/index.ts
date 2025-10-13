import {
  ProfileResponse,
  UpdateProfileData,
  ImageUploadResponse,
  SettingsResponse,
  ChangePasswordData,
  PasswordChangeResponse,
  DevicesResponse,
  LogoutDeviceData,
  LogoutResponse,
  DeleteAccountData,
  DeleteAccountResponse,
} from "@/types/dashboard/settings";
import api from "../../auth";

// ==================== PROFILE ENDPOINTS ====================

/**
 * Get user profile with member data
 */
export const getUserProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get('/v1/profile/');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch profile');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: UpdateProfileData): Promise<ProfileResponse> => {
  try {
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.put('/v1/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (image: File): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('profile_image', image);

    const response = await api.post('/v1/profile/upload_image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to upload image');
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (): Promise<ImageUploadResponse> => {
  try {
    const response = await api.delete('/v1/profile/delete_image/');
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete image:', error);
    throw new Error(error?.response?.data?.message || 'Failed to delete image');
  }
};

// ==================== SETTINGS ENDPOINTS ====================

/**
 * Get user settings
 */
export const getUserSettings = async (): Promise<SettingsResponse> => {
  try {
    const response = await api.get('/v1/settings/');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch settings:', error);
    throw new Error(error?.response?.data?.message || 'Failed to fetch settings');
  }
};

export const changePassword = async (data: ChangePasswordData): Promise<PasswordChangeResponse> => {
  try {
    const response = await api.post('/v1/settings/change_password/', data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      throw error.response.data; 
    }
    throw new Error('Failed to change password');
  }
};


/**
 * Get active devices/sessions
 */
export const getActiveDevices = async (): Promise<DevicesResponse> => {
  try {
    const response = await api.get('/v1/settings/devices/');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch devices:', error);
    throw new Error(error?.response?.data?.message || 'Failed to fetch devices');
  }
};

/**
 * Logout from specific device
 */
export const logoutDevice = async (data: LogoutDeviceData): Promise<LogoutResponse> => {
  try {
    const response = await api.post('/v1/settings/logout_device/', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to logout device:', error);
    throw new Error(error?.response?.data?.message || 'Failed to logout device');
  }
};

/**
 * Logout from all devices except current
 */
export const logoutAllDevices = async (): Promise<LogoutResponse> => {
  try {
    const response = await api.post('/v1/settings/logout_all/');
    return response.data;
  } catch (error: any) {
    console.error('Failed to logout all devices:', error);
    throw new Error(error?.response?.data?.message || 'Failed to logout all devices');
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (data: DeleteAccountData): Promise<DeleteAccountResponse> => {
  try {
    const response = await api.post('/v1/settings/delete_account/', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete account:', error);
    throw new Error(error?.response?.data?.message || 'Failed to delete account');
  }
};

// ==================== COMBINED FETCH ====================

/**
 * Fetch all profile and settings data in one call
 * Useful for settings/profile page initialization
 */
export const fetchAllUserData = async () => {
  try {
    const [profile, settings, devices] = await Promise.all([
      getUserProfile(),
      getUserSettings(),
      getActiveDevices(),
    ]);

    return {
      success: true,
      data: {
        profile: profile.profile,
        settings: settings.settings,
        devices: devices.devices,
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch all user data:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch user data',
    };
  }
};