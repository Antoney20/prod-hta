import type { Member, APIResponse } from "@/types/dashboard/members";
import api from "../../auth";

/**
 * Get all members
 */
export const getMembers = async (): Promise<APIResponse<Member>> => {
  try {
    const response = await api.get('/v1/members/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch members');
  }
};