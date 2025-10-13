export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  country: string;
  is_email_verified: boolean;
  status: string;
  is_active: boolean;
  date_joined: string | null;
}

export interface MemberData {
  id: number;
  position: string;
  organization: string;
  phone_number: string;
  notes: string;
  is_profile_complete: boolean;
  created_at: string;
}

export interface UserPermissions {
  is_admin: boolean;
  is_secretariate: boolean;
  is_content_manager: boolean;
}

export interface UserProfile {
  user: UserData;
  member: MemberData;
  roles: string[];
  permissions: UserPermissions;
}

export interface ProfileResponse {
  success: boolean;
  profile: UserProfile;
  message?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  country?: string;
  username?: string;
  position?: string;
  organization?: string;
  phone_number?: string;
  notes?: string;
  profile_image?: File;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  profile_image?: string;
}

// Settings Types
export interface AccountSettings {
  email: string;
  username: string;
  is_email_verified: boolean;
  status: string;
  is_active: boolean;
  date_joined: string | null;
  last_login: string | null;
}

export interface SecuritySettings {
  active_sessions: number;
}

export interface UserSettings {
  account: AccountSettings;
  security: SecuritySettings;
  roles: string[];
}

export interface SettingsResponse {
  success: boolean;
  settings: UserSettings;
  message?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface DeviceSession {
  session_key: string;
  is_current: boolean;
  expire_date: string;
}

export interface DevicesResponse {
  success: boolean;
  devices: DeviceSession[];
  total: number;
  message?: string;
}

export interface LogoutDeviceData {
  session_key: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountData {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface APIError {
  success: false;
  message: string;
}