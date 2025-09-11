'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, checkAndRefreshAuth, fetchCurrentUser, UserProfile } from '@/app/api/auth'

import { toast } from 'react-toastify'
import { useAuthContext } from './auth'

export const globalUserStore = {
  userData: null as UserProfile | null,
  isLoaded: false,
  
  setUserData: function(data: UserProfile | null) {
    this.userData = data
    this.isLoaded = true
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-user-update', { 
        detail: { userData: data } 
      }))
    }
  },
  
  clearUserData: function() {
    this.userData = null
    this.isLoaded = false
    
    // Dispatch event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-user-update', { 
        detail: { userData: null } 
      }))
    }
  },
  
  getUserData: function(): UserProfile | null {
    return this.userData
  },
  
  isUserLoaded: function(): boolean {
    return this.isLoaded
  }
}

interface AuthGuardProps {
  children: ReactNode
  publicRoutes?: string[]
  loadingComponent?: ReactNode
  redirectTo?: string
}

export default function AuthGuard({
  children,
  publicRoutes = ["/", "/auth/login", "/auth/register", "/news", "/gallery", "/about", "/contact"],
  loadingComponent,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const defaultLoadingComponent = (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )

  useEffect(() => {
    async function checkAuthentication() {
      try {
        setLoading(true)
        
        const isPublicPath = publicRoutes.some((route) => {
          if (route === "/" && pathname === "/") return true
          if (route !== "/" && pathname?.startsWith(route)) return true
          return false
        })
        
        // If on a public path, allow access
        if (isPublicPath) {
          setAuthorized(true)
          setLoading(false)
          
          // Still try to load user data if authenticated (for navbar, etc.)
          if (isAuthenticated() && !globalUserStore.isUserLoaded()) {
            try {
              const userData = await fetchCurrentUser()
              if (userData) {
                globalUserStore.setUserData(userData)
                setUser(userData)
              }
            } catch (error) {
              console.error('Error fetching user data on public route:', error)
              // Don't show error toast on public routes
            }
          }
          return
        }
        
        // For protected routes, check authentication
        const isAuthed = await checkAndRefreshAuth()
        
        if (!isAuthed) {
          // If not authenticated, redirect to login
          globalUserStore.clearUserData()
          setUser(null)
          setAuthorized(false)
          router.push(redirectTo)
          return
        }
        
        // User is authenticated
        setAuthorized(true)
        
        // Fetch and store user data if not already loaded
        if (!globalUserStore.isUserLoaded()) {
          try {
            const userData = await fetchCurrentUser()
            if (userData) {
              globalUserStore.setUserData(userData)
              setUser(userData)
            } else {
              // User data fetch failed, might indicate invalid token
              globalUserStore.clearUserData()
              setUser(null)
              setAuthorized(false)
              router.push(redirectTo)
            }
          } catch (error) {

            toast.error('Unexpected error occurred')
            
            globalUserStore.clearUserData()
            setUser(null)
          }
        } else {
          // User data already loaded, sync with context
          const userData = globalUserStore.getUserData()
          if (userData) {
            setUser(userData)
          }
        }
        
      } catch (error) {
        globalUserStore.clearUserData()
        setUser(null)
        setAuthorized(false)
        
        // Only redirect if not on a public route
        const isPublicPath = publicRoutes.some((route) => {
          if (route === "/" && pathname === "/") return true
          if (route !== "/" && pathname?.startsWith(route)) return true
          return false
        })
        
        if (!isPublicPath) {
          router.push(redirectTo)
        }
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthentication()
  }, [pathname, publicRoutes, router, redirectTo, setUser])

  // Listen for auth changes from other parts of the app
  useEffect(() => {
    const handleAuthChange = () => {
      // Re-run auth check when auth state changes
      const isPublicPath = publicRoutes.some((route) => {
        if (route === "/" && pathname === "/") return true
        if (route !== "/" && pathname?.startsWith(route)) return true
        return false
      })
      
      if (!isPublicPath && !isAuthenticated()) {
        globalUserStore.clearUserData()
        setUser(null)
        setAuthorized(false)
        router.push(redirectTo)
      }
    }

    const handleGlobalUserUpdate = (event: CustomEvent) => {
      const { userData } = event.detail
      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
      }
    }

    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
    }
  }, [pathname, publicRoutes, router, redirectTo, setUser])

  if (loading) {
    return loadingComponent || defaultLoadingComponent
  }
  return authorized ? <>{children}</> : null
}

export function useGlobalUser() {
  const [userData, setUserData] = useState<UserProfile | null>(globalUserStore.getUserData())
  
  useEffect(() => {
    const handleGlobalUserUpdate = (event: CustomEvent) => {
      setUserData(event.detail.userData)
    }

    window.addEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
    
    return () => {
      window.removeEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
    }
  }, [])

  return {
    user: userData,
    isLoaded: globalUserStore.isUserLoaded(),
    setUser: (user: UserProfile | null) => {
      globalUserStore.setUserData(user)
    },
    clearUser: () => {
      globalUserStore.clearUserData()
    }
  }
}