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

export const updateMember = async (id: string, data: Partial<Member>): Promise<Member> => {
  const response = await api.patch(`/v1/members/${id}/`, data);
  return response.data;
};
 
export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/v1/members/${id}/`);
};
 