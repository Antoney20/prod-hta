'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { 
  logout as apiLogout, 
  fetchCurrentUser, 
  UserProfile, 
  login as apiLogin,
  AuthResponse,
  isAuthenticated
} from '@/app/api/auth'
import { toast } from 'react-toastify'

interface AuthContextType {
  user: UserProfile | null
  isLoggedIn: boolean
  loading: boolean
  login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (userData: Partial<UserProfile>) => void
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: false,
  login: async () => ({ success: false, message: 'Failed to login' }),
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: () => {},
  setUser: () => {}
})

export const useAuthContext = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await apiLogin(usernameOrEmail, password)
      
      if (response.success && response.user) {
        setUser(response.user)
        toast.success('Login successful!')
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('auth-change'))
        
        // Redirect after successful login
        router.push('/portal')
      } else {
        toast.error(response.message || 'Login failed')
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true)
      await apiLogout()
      setUser(null)
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('auth-change'))
      
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear user state even if API call fails
      setUser(null)
      window.dispatchEvent(new CustomEvent('auth-change'))
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (isAuthenticated()) {
      try {
        const userData = await fetchCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to refresh user:', error)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  const updateUser = (userData: Partial<UserProfile>): void => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token_backup' || e.key === 'refresh_token_backup') {
        // Token changed in another tab
        if (isAuthenticated()) {
          refreshUser()
        } else {
          setUser(null)
        }
      }
    }

    // Listen for custom auth events
    const handleAuthChange = () => {
      if (isAuthenticated()) {
        refreshUser()
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  const contextValue: AuthContextType = {
    user,
    isLoggedIn: !!user && isAuthenticated(),
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
    updateUser,
    setUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}