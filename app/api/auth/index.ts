import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = process.env.API_URL || API_BASE_URL;

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

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

export interface UserProfile extends User {
  profile_image?: string;
  last_login?: string;
  date_joined?: string;
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
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
};

// API functions
export const fetchCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get('/v1/auth/user/me/');
    return response.data;
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
    // Continue with cleanup even if server request fails
  } finally {
    clearTokens();
    
    if (typeof window !== 'undefined') {
      // Use router.push if using Next.js router, otherwise use window.location
      window.location.href = '/v1/auth/login';
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
        // Only redirect if we're in browser and not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/v1/auth/login')) {
          window.location.href = '/v1/auth/login';
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
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/v1/auth/login')) {
          window.location.href = '/v1/auth/login';
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