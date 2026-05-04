import { UserRole } from '@/app/api/auth'


export const ROLE_HIERARCHY: UserRole[] = [
  'user',
  'swg',
  'panel',           
  'content_manager',
  'secretariat',
  'admin',
]
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',

  // Tools Configuration
  VIEW_TOOLS_CONFIG: 'view_tools_config',
  MANAGE_CRITERIA_SELECTION: 'manage_criteria_selection',
  MANAGE_SYSTEM_CATEGORIES: 'manage_system_categories',

  // Proposal Selection
  VIEW_PROPOSAL_SELECTION: 'view_proposal_selection',
  ASSIGN_SYSTEM_CATEGORIES: 'assign_system_categories',
  VIEW_INTERVENTIONS_BY_CATEGORY: 'view_interventions_by_category',
  SCORE_INTERVENTIONS: 'score_interventions',
  VIEW_SCORING_REPORTS: 'view_scoring_reports',

  // Interventions Tracker
  VIEW_INTERVENTIONS: 'view_interventions',
  VIEW_ALL_PROPOSALS: 'view_all_proposals',
  ASSIGN_CATEGORIES: 'assign_categories',
  ASSIGN_REVIEWERS: 'assign_reviewers',
  VIEW_ASSIGNED_TO_ME: 'view_assigned_to_me',
  VIEW_REVIEW_PROGRESS: 'view_review_progress',
  VIEW_DECISION_RATIONALE: 'view_decision_rationale',
  VIEW_IMPLEMENTATION_STATUS: 'view_implementation_status',
  VIEW_REPORTS_ANALYTICS: 'view_reports_analytics',

  // Records
  VIEW_RECORDS: 'view_records',
  MANAGE_RECORDS: 'manage_records',

  // Calendar & Events
  VIEW_EVENTS: 'view_events',
  MANAGE_EVENTS: 'manage_events',

  // Resources & Documents
  VIEW_RESOURCES: 'view_resources',
  MANAGE_RESOURCES: 'manage_resources',

  // Members
  VIEW_MEMBERS: 'view_members',
  MANAGE_MEMBERS: 'manage_members',

  // Tasks
  VIEW_TASKS: 'view_tasks',
  MANAGE_TASKS: 'manage_tasks',

  // Content Management
  VIEW_CONTENT: 'view_content',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_FAQS: 'manage_faqs',
  MANAGE_NEWS: 'manage_news',
  MANAGE_GOVERNANCE: 'manage_governance',
  MANAGE_MEDIA: 'manage_media',
  VIEW_CONTACT_MESSAGES: 'view_contact_messages',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',

  // Settings & Admin
  VIEW_SETTINGS: 'view_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// ==================== ROLE → PERMISSIONS MAP ====================
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_RECORDS,
    // PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.VIEW_ASSIGNED_TO_ME,
        PERMISSIONS.SCORE_INTERVENTIONS,
    PERMISSIONS.VIEW_INTERVENTIONS_BY_CATEGORY,
  ],

  swg: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.VIEW_TASKS,

    PERMISSIONS.SCORE_INTERVENTIONS,
    PERMISSIONS.VIEW_INTERVENTIONS_BY_CATEGORY,
    PERMISSIONS.VIEW_REVIEW_PROGRESS,
  ],

panel: [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_EVENTS,
  PERMISSIONS.VIEW_RESOURCES,
  PERMISSIONS.VIEW_TASKS,
  PERMISSIONS.VIEW_RECORDS,
  PERMISSIONS.VIEW_INTERVENTIONS,
  PERMISSIONS.VIEW_ALL_PROPOSALS,
  PERMISSIONS.VIEW_ASSIGNED_TO_ME,
  PERMISSIONS.SCORE_INTERVENTIONS,
  PERMISSIONS.VIEW_INTERVENTIONS_BY_CATEGORY,
  PERMISSIONS.VIEW_REVIEW_PROGRESS,
  PERMISSIONS.VIEW_SCORING_REPORTS,
],

  content_manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.MANAGE_RESOURCES,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.MANAGE_RECORDS,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.VIEW_ALL_PROPOSALS,
    PERMISSIONS.VIEW_ASSIGNED_TO_ME,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_FAQS,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.MANAGE_GOVERNANCE,
    PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.VIEW_CONTACT_MESSAGES,
    PERMISSIONS.MANAGE_SUBSCRIPTIONS,
  ],

  secretariat: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TOOLS_CONFIG,
    PERMISSIONS.MANAGE_CRITERIA_SELECTION,
    PERMISSIONS.MANAGE_SYSTEM_CATEGORIES,
    PERMISSIONS.VIEW_PROPOSAL_SELECTION,
    PERMISSIONS.ASSIGN_SYSTEM_CATEGORIES,
    PERMISSIONS.VIEW_INTERVENTIONS_BY_CATEGORY,
    PERMISSIONS.SCORE_INTERVENTIONS,
    PERMISSIONS.VIEW_SCORING_REPORTS,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.VIEW_ALL_PROPOSALS,
    PERMISSIONS.ASSIGN_CATEGORIES,
    PERMISSIONS.ASSIGN_REVIEWERS,
    PERMISSIONS.VIEW_ASSIGNED_TO_ME,
    PERMISSIONS.VIEW_REVIEW_PROGRESS,
    PERMISSIONS.VIEW_DECISION_RATIONALE,
    PERMISSIONS.VIEW_IMPLEMENTATION_STATUS,
    PERMISSIONS.VIEW_REPORTS_ANALYTICS,
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.MANAGE_RECORDS,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.MANAGE_RESOURCES,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  admin: Object.values(PERMISSIONS) as Permission[],
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission)
}

/**
 * Check if a role has ALL of the given permissions
 */
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => roleHasPermission(role, p))
}

/**
 * Check if a role has ANY of the given permissions
 */
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => roleHasPermission(role, p))
}

/**
 * Check if a role is at least as privileged as the required role
 */
export function roleIsAtLeast(role: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(requiredRole)
}

/**
 * Check if a user's role is one of the allowed roles
 */
export function isRoleAllowed(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}


export function canSeeNavItem(role: UserRole, requiredPermission: Permission): boolean {
  return roleHasPermission(role, requiredPermission)
}