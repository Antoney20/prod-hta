import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = `${process.env.API_URL || API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface DecodedToken {
  exp: number;
  user_id: string;
  [key: string]: any;
}

export interface Member {
  id: number | null;
  position: string | null;
  organization: string | null;
  phone_number: string | null;
  notes: string | null;
  created_at: string | null;
  is_profile_complete: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  groups: string[];
  user_permissions: string[];
  country: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  status: string;
  is_blocked: boolean;
  last_login: string;
  member: Member;
}



export interface Member {
  id: number | null;
  position: string | null;
  organization: string | null;
  phone_number: string | null;
  notes: string | null;
  created_at: string | null;
  is_profile_complete: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    country: string | null;
    status: string;
    is_email_verified: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  groups: string[];
  user_permissions: string[];
  country: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  status: string;
  is_blocked: boolean;
  last_login: string;
  member: Member;
}

export interface UserProfile extends User {
  profile_image?: string;
  date_joined?: string;
  member: Member;
}


export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    access: string;
    refresh: string;
  };
  errors?: any;
}

// ==================== REGISTRATION TYPES ====================
export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  country: string;
  profile_image?: File | null;
}

export interface RegisterMemberData {
  position: string;
  organization: string;
  phone_number: string;
  notes: string;
}

// In-memory token storage as primary source
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

// Cookie handlers
const setCookie = (name: string, value: string, days = 7, secure = true) => {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secureFlag = secure && window.location.protocol === 'https:' ? 'secure; ' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${secureFlag}samesite=strict;`;
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
  }
  return null;
};

const removeCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  }
};

// Token validation and management
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Add 30 second buffer to prevent edge cases
    return decoded.exp * 1000 > Date.now() + 30000;
  } catch (error) {
    return false;
  }
};

const getAccessToken = (): string | null => {
  if (memoryAccessToken && isTokenValid(memoryAccessToken)) {
    return memoryAccessToken;
  }
  
  const cookieToken = getCookie('access_token_backup');
  if (cookieToken && isTokenValid(cookieToken)) {
    memoryAccessToken = cookieToken;
    return cookieToken;
  }
  
  // Clean up invalid token
  if (cookieToken) {
    removeCookie('access_token_backup');
  }
  memoryAccessToken = null;
  
  return null;
};

const getRefreshToken = (): string | null => {
  if (memoryRefreshToken && isTokenValid(memoryRefreshToken)) {
    return memoryRefreshToken;
  }
  
  const cookieToken = getCookie('refresh_token_backup');
  if (cookieToken && isTokenValid(cookieToken)) {
    memoryRefreshToken = cookieToken;
    return cookieToken;
  }
  
  // Clean up invalid token
  if (cookieToken) {
    removeCookie('refresh_token_backup');
  }
  memoryRefreshToken = null;
  
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;
  
  // Store access token for 1 day (matching backend config)
  setCookie('access_token_backup', accessToken, 1);
  // Store refresh token for 10 days (matching backend config)
  setCookie('refresh_token_backup', refreshToken, 10);
};

const clearTokens = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  
  removeCookie('access_token_backup');
  removeCookie('refresh_token_backup');
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken || !isTokenValid(refreshToken)) {
    clearTokens();
    return null;
  }

  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/token/refresh/`,
      { refresh: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.access) {
      memoryAccessToken = response.data.access;
      setCookie('access_token_backup', response.data.access, 1);
      return response.data.access;
    }
    return null;
  } catch (error) {
    clearTokens();
    return null;
  }
};

// API functions
export const fetchCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get('/v1/auth/user/me/');
    
    if (response.data.success && response.data.data) {
      return response.data.data as UserProfile;
    }
    
    return response.data as UserProfile;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

export const login = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/v1/auth/login/', {
      username_or_email: usernameOrEmail,
      password,
    });

    const data = response.data as AuthResponse;

    if (data.success && data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
    }

    return data;
  } catch (error: any) {
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    
    throw new Error('Login failed: Network error');
  }
};

// ==================== REGISTRATION FUNCTIONS (NEW) ====================


/**
 * Register new user with combined user + member data
 */
export const registerUser = async (
  userData: RegisterUserData,
  memberData?: RegisterMemberData,
  profileImage?: File | null
): Promise<AuthResponse> => {
  try {
    const combinedData = memberData ? { ...userData, ...memberData } : userData;

    const formData = new FormData();
    
    Object.entries(combinedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') { 
        formData.append(key, String(value));
      }
    });
    
    if (profileImage instanceof File) {
      formData.append('profile_image', profileImage);
    }

    const response = await api.post('/v1/auth/register/', formData, {
      headers: {
        'Content-Type': undefined, 
      },
    });

    const data = response.data as AuthResponse;

    if (data.success && data.tokens) {
      setTokens(data.tokens.access, data.tokens.refresh);
    }

    return data;
  } catch (error: any) {

    if (error?.response?.status === 400) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.response.data.errors || error.response.data,
      };
    }

    return {
      success: false,
      message: error?.response?.data?.message || 'Registration failed. Please try again.',
      errors: error?.response?.data?.errors,
    };
  }
};

/**
 * Complete member profile after registration
 */
export const completeMemberProfile = async (data: RegisterMemberData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/v2/users/profile/complete/', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to complete profile',
      errors: error?.response?.data?.errors,
    };
  }
};

/**
 * Request password reset - sends email with reset link
 */
export const requestPasswordReset = async (emailOrUsername: string) => {
  try {
    const response = await api.post('/v1/auth/password-reset/', {
      email_or_username: emailOrUsername
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to send reset email. Please try again.'
    };
  }
};

/**
 * Confirm password reset with token
 */
export const confirmPasswordReset = async (
  uid: string,
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post('/v1/auth/password-reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to reset password. Please try again.'
    };
  }
};




export const logout = async (): Promise<void> => {
  try {
    const token = getAccessToken();
    if (token) {
      await api.post('/v1/auth/logout/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
    
    if (typeof window !== 'undefined') {
      // Use router.push if using Next.js router, otherwise use window.location
      window.location.href = '/auth/login';
    }
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return isTokenValid(token);
};

export const checkAndRefreshAuth = async (): Promise<boolean> => {
  const token = getAccessToken();
  
  if (!token) {
    return false;
  }
  
  if (isTokenValid(token)) {
    return true;
  }
  
  // Try to refresh if access token is invalid
  const newToken = await refreshAccessToken();
  return !!newToken;
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();
    
    // If token is invalid or expired, try to refresh
    if (token && !isTokenValid(token)) {
      token = await refreshAccessToken();
      
      if (!token) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(new Error('Authentication failed'));
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// React hook for authentication state management
export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const syncTokensToState = () => {
    setAccessToken(getAccessToken());
    setRefreshToken(getRefreshToken());
  };
  
  // Enhanced login for React components
  const reactLogin = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    const data = await login(usernameOrEmail, password);
    syncTokensToState();
    
    if (data.success && data.user) {
      setUser(data.user);
    }
    
    return data;
  };

  // Enhanced register for React components
  const reactRegister = async (
    userData: RegisterUserData,
    memberData?: RegisterMemberData
  ): Promise<AuthResponse> => {
    const data = await registerUser(userData, memberData);
    syncTokensToState();
    
    if (data.success && data.user) {
      setUser(data.user);
    }
    
    return data;
  };
  
  // Enhanced logout for React components
  const reactLogout = async (): Promise<void> => {
    await logout();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };
  
  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      syncTokensToState();
      
      if (isAuthenticated()) {
        try {
          const userData = await fetchCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data during init:', error);
          // Don't clear tokens here - let the user continue if possible
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  // Periodic token check
  useEffect(() => {
    const checkTokens = () => {
      const currentAccessToken = getAccessToken();
      const currentRefreshToken = getRefreshToken();
      
      if (currentAccessToken !== accessToken) {
        setAccessToken(currentAccessToken);
      }
      
      if (currentRefreshToken !== refreshToken) {
        setRefreshToken(currentRefreshToken);
      }
    };
    
    // Check every minute
    const interval = setInterval(checkTokens, 60000);
    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);
  
  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && isTokenValid(accessToken),
    isLoading,
    login: reactLogin,
    register: reactRegister,
    logout: reactLogout,
    refreshAuth: async (): Promise<boolean> => {
      const newToken = await refreshAccessToken();
      syncTokensToState();
      return !!newToken;
    },
    fetchUser: async (): Promise<UserProfile | null> => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    updateUser: (userData: UserProfile) => {
      setUser(userData);
    }
  };
};

export default api;

export const getAccessTokenForWebSocket = (): string | null => {
  if (memoryAccessToken && isTokenValid(memoryAccessToken)) {
    return memoryAccessToken;
  }
  
  const cookieToken = getCookie('access_token_backup');
  if (cookieToken && isTokenValid(cookieToken)) {
    memoryAccessToken = cookieToken;
    return cookieToken;
  }
  
  // Clean up invalid token
  if (cookieToken) {
    removeCookie('access_token_backup');
  }
  memoryAccessToken = null;
  
  return null;
};