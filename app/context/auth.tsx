


// 'use client'

// import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
// import { useRouter } from 'next/navigation'
// import {
//   logout as apiLogout,
//   fetchCurrentUser,
//   UserProfile,
//   login as apiLogin,
//   AuthResponse,
//   isAuthenticated,
//   getAccessToken,      
// } from '@/app/api/auth'
// import { jwtDecode } from 'jwt-decode'
// import { toast } from 'react-toastify'

// // ── Decode role from token synchronously (no fetch needed) ────────────────────
// function getRoleFromToken(): string | null {
//   try {
//     const token = getAccessToken()
//     if (!token) return null
//     const decoded = jwtDecode<{ role?: string }>(token)
//     return decoded.role ?? null
//   } catch {
//     return null
//   }
// }

// // Build a minimal stub user from the token so the sidebar never flickers.
// // Full user data is fetched and replaces this stub immediately after mount.
// function buildStubFromToken(): Partial<UserProfile> | null {
//   const role = getRoleFromToken()
//   if (!role) return null
//   return { role: role as UserProfile['role'] }
// }

// interface AuthContextType {
//   user: UserProfile | null
//   isLoggedIn: boolean
//   loading: boolean
//   login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>
//   logout: () => Promise<void>
//   refreshUser: () => Promise<void>
//   updateUser: (userData: Partial<UserProfile>) => void
//   setUser: (user: UserProfile | null) => void
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   isLoggedIn: false,
//   loading: false,
//   login: async () => ({ success: false, message: 'Failed to login' }),
//   logout: async () => {},
//   refreshUser: async () => {},
//   updateUser: () => {},
//   setUser: () => {},
// })

// export const useAuthContext = () => useContext(AuthContext)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   // Seed role instantly from token — prevents "Preparing..." flicker on reload
//   const [user, setUser] = useState<UserProfile | null>(() => {
//     if (typeof window === 'undefined') return null
//     const stub = buildStubFromToken()
//     return stub as UserProfile | null
//   })
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   // On mount, fetch the full user profile and replace the stub
//   useEffect(() => {
//     if (!isAuthenticated()) {
//       setUser(null)
//       return
//     }
//     fetchCurrentUser()
//       .then((userData) => {
//         if (userData) setUser(userData)
//         else setUser(null)
//       })
//       .catch(() => setUser(null))
//   }, [])

//   const handleLogin = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
//     try {
//       setLoading(true)
//       const response = await apiLogin(usernameOrEmail, password)

//       if (response.success && response.user) {
//         setUser(response.user)
//         toast.success('Login successful!')
//         window.dispatchEvent(new CustomEvent('auth-change'))
//         router.push('/portal')
//       } else {
//         toast.error(response.message || 'Login failed')
//       }

//       return response
//     } catch (error: any) {
//       const errorMessage = error.message || 'Login failed. Please try again.'
//       toast.error(errorMessage)
//       throw error
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleLogout = async (): Promise<void> => {
//     try {
//       setLoading(true)
//       await apiLogout()
//       setUser(null)
//       window.dispatchEvent(new CustomEvent('auth-change'))
//       toast.success('Logged out successfully')
//       router.push('/auth/login')
//     } catch (error) {
//       console.error('Logout error:', error)
//       setUser(null)
//       window.dispatchEvent(new CustomEvent('auth-change'))
//       router.push('/auth/login')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const refreshUser = async (): Promise<void> => {
//     if (isAuthenticated()) {
//       try {
//         const userData = await fetchCurrentUser()
//         setUser(userData)
//       } catch {
//         setUser(null)
//       }
//     } else {
//       setUser(null)
//     }
//   }

//   const updateUser = (userData: Partial<UserProfile>): void => {
//     if (user) setUser({ ...user, ...userData })
//   }

//   // Multi-tab support
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'access_token_backup' || e.key === 'refresh_token_backup') {
//         if (isAuthenticated()) refreshUser()
//         else setUser(null)
//       }
//     }
//     const handleAuthChange = () => {
//       if (isAuthenticated()) refreshUser()
//       else setUser(null)
//     }
//     window.addEventListener('storage', handleStorageChange)
//     window.addEventListener('auth-change', handleAuthChange)
//     return () => {
//       window.removeEventListener('storage', handleStorageChange)
//       window.removeEventListener('auth-change', handleAuthChange)
//     }
//   }, [])

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoggedIn: !!user?.role && isAuthenticated(),
//         loading,
//         login: handleLogin,
//         logout: handleLogout,
//         refreshUser,
//         updateUser,
//         setUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }


'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  logout as apiLogout,
  fetchCurrentUser,
  UserProfile,
  login as apiLogin,
  AuthResponse,
  isAuthenticated,
  getAccessToken,
} from '@/app/api/auth'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'

function getRoleFromToken(): string | null {
  try {
    const token = getAccessToken()
    if (!token) return null
    const decoded = jwtDecode<{ role?: string }>(token)
    return decoded.role ?? null
  } catch {
    return null
  }
}

// Build a minimal stub user from the token so the sidebar never flickers.
// Full user data is fetched and replaces this stub immediately after mount.
function buildStubFromToken(): Partial<UserProfile> | null {
  const role = getRoleFromToken()
  if (!role) return null
  return { role: role as UserProfile['role'] }
}

interface AuthContextType {
  user: UserProfile | null
  isLoggedIn: boolean
  loading: boolean
  initializing: boolean
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
  initializing: true,
  login: async () => ({ success: false, message: 'Failed to login' }),
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: () => {},
  setUser: () => {},
})

export const useAuthContext = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Seed role instantly from token — prevents "Preparing..." flicker on reload
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null
    const stub = buildStubFromToken()
    return stub as UserProfile | null
  })
  // True until the initial auth-check resolves — prevents RoleGuard flash
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // On mount, fetch the full user profile and replace the stub
  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null)
      setInitializing(false)
      return
    }
    fetchCurrentUser()
      .then((userData) => {
        if (userData) setUser(userData)
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setInitializing(false))
  }, [])

  const handleLogin = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await apiLogin(usernameOrEmail, password)

      if (response.success && response.user) {
        setUser(response.user)
        toast.success('Login successful!')
        window.dispatchEvent(new CustomEvent('auth-change'))
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
      window.dispatchEvent(new CustomEvent('auth-change'))
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
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
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  const updateUser = (userData: Partial<UserProfile>): void => {
    if (user) setUser({ ...user, ...userData })
  }

  // Multi-tab support
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token_backup' || e.key === 'refresh_token_backup') {
        if (isAuthenticated()) refreshUser()
        else setUser(null)
      }
    }
    const handleAuthChange = () => {
      if (isAuthenticated()) refreshUser()
      else setUser(null)
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleAuthChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user?.role && isAuthenticated(),
        loading,
        initializing,
        login: handleLogin,
        logout: handleLogout,
        refreshUser,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}