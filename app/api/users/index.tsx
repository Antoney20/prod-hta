export type UserStatus = "active" | "inactive" | "suspended";
export interface UserSummary {
  id:            number;        
  member_id:     number | null; 
  full_name:     string;
  email:         string;
  profile_image: string | null;
  role:          UserRole;
  status:        UserStatus;
  is_active:     boolean;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data:    UserSummary[];
}


import api, { UserRole } from "../auth";

export const getUsers = async (): Promise<UsersListResponse | null> => {
  try {
    const res = await api.get<UsersListResponse>("/v3/users/");
    return res.data;
  } catch (err) {
    console.error("[users] Failed to fetch users", err);
    return null;
  }
};
