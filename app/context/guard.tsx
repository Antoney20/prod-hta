// 'use client'

// import { ReactNode, useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { isAuthenticated, checkAndRefreshAuth, fetchCurrentUser, UserProfile } from '@/app/api/auth'
// import { toast } from 'react-toastify'
// import { useAuthContext } from './auth'

// export const globalUserStore = {
//   userData: null as UserProfile | null,
//   isLoaded: false,
//   isInitialized: false, 
//   setUserData: function(data: UserProfile | null) {
//     this.userData = data
//     this.isLoaded = true
//     this.isInitialized = true
    
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('global-user-update', { 
//         detail: { userData: data } 
//       }))
//     }
//   },
  
//   clearUserData: function() {
//     this.userData = null
//     this.isLoaded = false
//     this.isInitialized = true // We've still been initialized, just no user data
    
//     // Dispatch event for other components to listen
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('global-user-update', { 
//         detail: { userData: null } 
//       }))
//     }
//   },
  
//   getUserData: function(): UserProfile | null {
//     return this.userData
//   },
  
//   isUserLoaded: function(): boolean {
//     return this.isLoaded
//   },

//   isStoreInitialized: function(): boolean {
//     return this.isInitialized
//   }
// }

// interface AuthGuardProps {
//   children: ReactNode
//   publicRoutes?: string[]
//   loadingComponent?: ReactNode
//   redirectTo?: string
// }

// export default function AuthGuard({
//   children,
//   publicRoutes = ["/", "/auth/login", "/auth/register", "/news", "/gallery", "/about", "/contact"],
//   loadingComponent,
//   redirectTo = '/auth/login'
// }: AuthGuardProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const { setUser } = useAuthContext()
//   const [loading, setLoading] = useState(false) // Start with false
//   const [authorized, setAuthorized] = useState(false)

//   const defaultLoadingComponent = (
//     <div className="flex h-screen items-center justify-center bg-gray-50">
//       <div className="flex flex-col items-center space-y-4">
//         <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#27aae1] border-t-transparent"></div>
//         <p className="text-gray-600 text-sm">Initializing HBTAP Communications Hub...</p>
//       </div>
//     </div>
//   )

//   useEffect(() => {
//     async function checkAuthentication() {
//       try {
//         // Only show loading if we haven't been initialized yet
//         if (!globalUserStore.isStoreInitialized()) {
//           setLoading(true)
//         }
        
//         const isPublicPath = publicRoutes.some((route) => {
//           if (route === "/" && pathname === "/") return true
//           if (route !== "/" && pathname?.startsWith(route)) return true
//           return false
//         })
        
//         // If on a public path, allow access
//         if (isPublicPath) {
//           setAuthorized(true)
          
//           // Still try to load user data if authenticated (for navbar, etc.)
//           if (isAuthenticated() && !globalUserStore.isUserLoaded()) {
//             try {
//               const userData = await fetchCurrentUser()
//               if (userData) {
//                 globalUserStore.setUserData(userData)
//                 setUser(userData)
//               } else {
//                 globalUserStore.clearUserData()
//               }
//             } catch (error) {
//               console.error('Error fetching user data on public route:', error)
//               globalUserStore.clearUserData()
//               // Don't show error toast on public routes
//             }
//           } else if (!isAuthenticated()) {
//             // User is not authenticated on public route
//             globalUserStore.clearUserData()
//             setUser(null)
//           } else if (globalUserStore.isUserLoaded()) {
//             // User data already loaded, sync with context
//             const userData = globalUserStore.getUserData()
//             setUser(userData)
//           }
          
//           setLoading(false)
//           return
//         }
        
//         // For protected routes, check authentication
//         const isAuthed = await checkAndRefreshAuth()
        
//         if (!isAuthed) {
//           // If not authenticated, redirect to login
//           globalUserStore.clearUserData()
//           setUser(null)
//           setAuthorized(false)
//           setLoading(false)
//           router.push(redirectTo)
//           return
//         }
        
//         // User is authenticated
//         setAuthorized(true)
        
//         // Fetch and store user data if not already loaded
//         if (!globalUserStore.isUserLoaded()) {
//           try {
//             const userData = await fetchCurrentUser()
//             if (userData) {
//               globalUserStore.setUserData(userData)
//               setUser(userData)
//             } else {
//               // User data fetch failed, might indicate invalid token
//               globalUserStore.clearUserData()
//               setUser(null)
//               setAuthorized(false)
//               router.push(redirectTo)
//             }
//           } catch (error) {
//             console.error('Error fetching user data:', error)
//             toast.error('Failed to load user information')
            
//             globalUserStore.clearUserData()
//             setUser(null)
//             setAuthorized(false)
//             router.push(redirectTo)
//           }
//         } else {
//           // User data already loaded, sync with context
//           const userData = globalUserStore.getUserData()
//           if (userData) {
//             setUser(userData)
//           }
//         }
        
//       } catch (error) {
//         console.error('Auth check error:', error)
//         globalUserStore.clearUserData()
//         setUser(null)
//         setAuthorized(false)
        
//         // Only redirect if not on a public route
//         const isPublicPath = publicRoutes.some((route) => {
//           if (route === "/" && pathname === "/") return true
//           if (route !== "/" && pathname?.startsWith(route)) return true
//           return false
//         })
        
//         if (!isPublicPath) {
//           router.push(redirectTo)
//         }
//       } finally {
//         setLoading(false)
//       }
//     }
    
//     checkAuthentication()
//   }, [pathname, publicRoutes, router, redirectTo, setUser])

//   // Listen for auth changes from other parts of the app
//   useEffect(() => {
//     const handleAuthChange = () => {
//       // Re-run auth check when auth state changes
//       const isPublicPath = publicRoutes.some((route) => {
//         if (route === "/" && pathname === "/") return true
//         if (route !== "/" && pathname?.startsWith(route)) return true
//         return false
//       })
      
//       if (!isPublicPath && !isAuthenticated()) {
//         globalUserStore.clearUserData()
//         setUser(null)
//         setAuthorized(false)
//         router.push(redirectTo)
//       }
//     }

//     const handleGlobalUserUpdate = (event: CustomEvent) => {
//       const { userData } = event.detail
//       if (userData) {
//         setUser(userData)
//       } else {
//         setUser(null)
//       }
//     }

//     // Only add listeners if we're in the browser
//     if (typeof window !== 'undefined') {
//       window.addEventListener('auth-change', handleAuthChange)
//       window.addEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
//     }
    
//     return () => {
//       if (typeof window !== 'undefined') {
//         window.removeEventListener('auth-change', handleAuthChange)
//         window.removeEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
//       }
//     }
//   }, [pathname, publicRoutes, router, redirectTo, setUser])

//   // Only show loading for initial app load, not for subsequent navigation
//   if (loading && !globalUserStore.isStoreInitialized()) {
//     return loadingComponent || defaultLoadingComponent
//   }

//   return authorized ? <>{children}</> : null
// }

// export function useGlobalUser() {
//   const [userData, setUserData] = useState<UserProfile | null>(globalUserStore.getUserData())
  
//   useEffect(() => {
//     const handleGlobalUserUpdate = (event: CustomEvent) => {
//       setUserData(event.detail.userData)
//     }

//     if (typeof window !== 'undefined') {
//       window.addEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
//     }
    
//     return () => {
//       if (typeof window !== 'undefined') {
//         window.removeEventListener('global-user-update', handleGlobalUserUpdate as EventListener)
//       }
//     }
//   }, [])

//   return {
//     user: userData,
//     isLoaded: globalUserStore.isUserLoaded(),
//     isInitialized: globalUserStore.isStoreInitialized(),
//     setUser: (user: UserProfile | null) => {
//       globalUserStore.setUserData(user)
//     },
//     clearUser: () => {
//       globalUserStore.clearUserData()
//     }
//   }
// }

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, checkAndRefreshAuth, fetchCurrentUser, UserProfile } from '@/app/api/auth'
import { toast } from 'react-toastify'
import { useAuthContext } from './auth'

interface GlobalUserStore {
  userData: UserProfile | null;
  isLoaded: boolean;
  isInitialized: boolean;
  setUserData: (data: UserProfile | null) => void;
  clearUserData: () => void;
  getUserData: () => UserProfile | null;
  isUserLoaded: () => boolean;
  isStoreInitialized: () => boolean;
}

export const globalUserStore: GlobalUserStore = {
  userData: null,
  isLoaded: false,
  isInitialized: false, 
  
  setUserData(data: UserProfile | null) {
    this.userData = data
    this.isLoaded = true
    this.isInitialized = true
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-user-update', { 
        detail: { userData: data } 
      }))
    }
  },
  
  clearUserData() {
    this.userData = null
    this.isLoaded = false
    this.isInitialized = true
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-user-update', { 
        detail: { userData: null } 
      }))
    }
  },
  
  getUserData(): UserProfile | null {
    return this.userData
  },
  
  isUserLoaded(): boolean {
    return this.isLoaded
  },

  isStoreInitialized(): boolean {
    return this.isInitialized
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
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const defaultLoadingComponent = (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#27aae1] border-t-transparent"></div>
        <p className="text-gray-600 text-sm">Initializing HBTAP Communications Hub...</p>
      </div>
    </div>
  )

  useEffect(() => {
    async function checkAuthentication() {
      try {
        if (!globalUserStore.isStoreInitialized()) {
          setLoading(true)
        }
        
        const isPublicPath = publicRoutes.some((route) => {
          if (route === "/" && pathname === "/") return true
          if (route !== "/" && pathname?.startsWith(route)) return true
          return false
        })
        
        if (isPublicPath) {
          setAuthorized(true)
          
          if (isAuthenticated() && !globalUserStore.isUserLoaded()) {
            try {
              const userData = await fetchCurrentUser()
              if (userData) {
                globalUserStore.setUserData(userData)
                setUser(userData)
              } else {
                globalUserStore.clearUserData()
              }
            } catch (error) {
              console.error('Error fetching user data on public route:', error)
              globalUserStore.clearUserData()
            }
          } else if (!isAuthenticated()) {
            globalUserStore.clearUserData()
            setUser(null)
          } else if (globalUserStore.isUserLoaded()) {
            const userData = globalUserStore.getUserData()
            setUser(userData)
          }
          
          setLoading(false)
          return
        }
        
        const isAuthed = await checkAndRefreshAuth()
        
        if (!isAuthed) {
          globalUserStore.clearUserData()
          setUser(null)
          setAuthorized(false)
          setLoading(false)
          router.push(redirectTo)
          return
        }
        
        setAuthorized(true)
        
        if (!globalUserStore.isUserLoaded()) {
          try {
            const userData = await fetchCurrentUser()
            if (userData) {
              globalUserStore.setUserData(userData)
              setUser(userData)
            } else {
              globalUserStore.clearUserData()
              setUser(null)
              setAuthorized(false)
              router.push(redirectTo)
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
            toast.error('Failed to load user information')
            
            globalUserStore.clearUserData()
            setUser(null)
            setAuthorized(false)
            router.push(redirectTo)
          }
        } else {
          const userData = globalUserStore.getUserData()
          if (userData) {
            setUser(userData)
          }
        }
        
      } catch (error) {
        console.error('Auth check error:', error)
        globalUserStore.clearUserData()
        setUser(null)
        setAuthorized(false)
        
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

  useEffect(() => {
    const handleAuthChange = () => {
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

    const handleGlobalUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userData: UserProfile | null }>
      const { userData } = customEvent.detail
      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange)
      window.addEventListener('global-user-update', handleGlobalUserUpdate)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-change', handleAuthChange)
        window.removeEventListener('global-user-update', handleGlobalUserUpdate)
      }
    }
  }, [pathname, publicRoutes, router, redirectTo, setUser])

  if (loading && !globalUserStore.isStoreInitialized()) {
    return loadingComponent || defaultLoadingComponent
  }

  return authorized ? <>{children}</> : null
}

export function useGlobalUser() {
  const [userData, setUserData] = useState<UserProfile | null>(globalUserStore.getUserData())
  
  useEffect(() => {
    const handleGlobalUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userData: UserProfile | null }>
      setUserData(customEvent.detail.userData)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('global-user-update', handleGlobalUserUpdate)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('global-user-update', handleGlobalUserUpdate)
      }
    }
  }, [])

  return {
    user: userData,
    isLoaded: globalUserStore.isUserLoaded(),
    isInitialized: globalUserStore.isStoreInitialized(),
    setUser: (user: UserProfile | null) => {
      globalUserStore.setUserData(user)
    },
    clearUser: () => {
      globalUserStore.clearUserData()
    }
  }
}