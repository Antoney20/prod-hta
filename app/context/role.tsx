'use client'

import { ReactNode, useEffect, useState } from 'react'
import { UserRole } from '@/app/api/auth'
import { globalUserStore } from './guard'

const ROLE_HIERARCHY: UserRole[] = [
  'user',
  'swg',
  'content_manager',
  'secretariat',
  'admin'
]

export function roleIsAtLeast(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole)
}

export function roleIsOneOf(userRole: UserRole, roles: UserRole[]): boolean {
  return roles.includes(userRole)
}

function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <p className="text-[120px] font-black text-gray-100 leading-none select-none">401</p>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-2 border-red-100">
              <svg
                className="w-9 h-9 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            You don&apos;t have permission to view this page.
            Contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Unauthorized
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/portal"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#27aae1] text-white text-sm font-medium hover:bg-[#1e90c5] transition-colors"
          >
            Go to Dashboard
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

interface RoleGuardProps {
  children: ReactNode
  roles?: UserRole[]
  minimumRole?: UserRole
  silent?: boolean
  fallback?: ReactNode
}

function checkAccess(roles?: UserRole[], minimumRole?: UserRole): boolean {
  const role = globalUserStore.userData?.role as UserRole | undefined
  if (!role) return false
  if (roles && !roleIsOneOf(role, roles)) return false
  if (minimumRole && !roleIsAtLeast(role, minimumRole)) return false
  return true
}

export default function RoleGuard({
  children,
  roles,
  minimumRole,
  silent = false,
  fallback,
}: RoleGuardProps) {
  // Start as loading if store isn't ready yet, otherwise resolve immediately
  const [loading, setLoading] = useState(!globalUserStore.isStoreInitialized())
  const [authorized, setAuthorized] = useState(
    globalUserStore.isStoreInitialized() ? checkAccess(roles, minimumRole) : false
  )

  useEffect(() => {
    // If store was already initialized when component mounted, we're done
    if (globalUserStore.isStoreInitialized()) {
      setAuthorized(checkAccess(roles, minimumRole))
      setLoading(false)
      return
    }

    // Otherwise wait for AuthGuard to fire the global-user-update event
    function onUserUpdate() {
      setAuthorized(checkAccess(roles, minimumRole))
      setLoading(false)
    }

    window.addEventListener('global-user-update', onUserUpdate)
    return () => window.removeEventListener('global-user-update', onUserUpdate)
  }, [roles, minimumRole])

  if (loading) return null

  if (!authorized) {
    if (silent) return null
    return fallback ? <>{fallback}</> : <ForbiddenPage />
  }

  return <>{children}</>
}

// export function AdminOnly({ children, silent }: { children: ReactNode; silent?: boolean }) {
//   return (
//     <RoleGuard roles={['admin']} silent={silent}>
//       {children}
//     </RoleGuard>
//   )
// }

export function AdminOnly({ children, silent, fallback }: { children: ReactNode; silent?: boolean; fallback?: ReactNode }) {
  return (
    <RoleGuard roles={['admin']} silent={silent} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function SecretariateAndAbove({ children, silent }: { children: ReactNode; silent?: boolean }) {
  return (
    <RoleGuard minimumRole="secretariat" silent={silent}>
      {children}
    </RoleGuard>
  )
}

export function SwgAndAbove({ children, silent }: { children: ReactNode; silent?: boolean }) {
  return (
    <RoleGuard minimumRole="swg" silent={silent}>
      {children}
    </RoleGuard>
  )
}