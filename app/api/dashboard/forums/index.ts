import { 
  AddMemberData, 
  APIResponse, 
  Channel, 
  ChannelMembership, 
  CreateChannelData, 
  CreateMessageData, 
  Message,
  ThreadReply 
} from "@/types/dashboard/forums";
import api from "../../auth";

/**
 * Get all forums/channels user has access to
 */
export const getForums = async (): Promise<APIResponse<Channel>> => {
  try {
    const response = await api.get('/v2/proj/forums/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch forums');
  }
};

/**
 * Get a specific forum/channel by ID
 */
export const getForum = async (id: string): Promise<Channel> => {
  try {
    const response = await api.get(`/v2/proj/forums/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch forum');
  }
};

/**
 * Create a new forum/channel
 */
export const createForum = async (data: CreateChannelData): Promise<Channel> => {
  try {
    const response = await api.post('/v2/proj/forums/', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create forum');
  }
};

/**
 * Update a forum/channel
 */
export const updateForum = async (id: string, data: Partial<CreateChannelData>): Promise<Channel> => {
  try {
    const response = await api.patch(`/v2/proj/forums/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update forum');
  }
};

/**
 * Delete a forum/channel
 */
export const deleteForum = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/forums/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete forum');
  }
};

/**
 * Get forum members
 */
export const getForumMembers = async (forumId: string): Promise<ChannelMembership[]> => {
  try {
    const response = await api.get(`/v2/proj/forums/${forumId}/members/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch forum members');
  }
};

/**
 * Add member to forum
 */
export const addForumMember = async (forumId: string, data: AddMemberData): Promise<ChannelMembership> => {
  try {
    const response = await api.post(`/v2/proj/forums/${forumId}/members/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add forum member');
  }
};

/**
 * Remove member from forum
 */
export const removeForumMember = async (forumId: string, membershipId: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/forums/${forumId}/members/${membershipId}/`);
  } catch (error) {
    throw new Error('Failed to remove forum member');
  }
};


/**
 * Get forum messages (main messages only, no thread replies)
 */
export const getForumMessages = async (forumId: string): Promise<APIResponse<Message>> => {
  try {
    const response = await api.get(`/v2/proj/forums/${forumId}/messages/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};


/**
 * Post message to forum
 */
export const postForumMessage = async (forumId: string, data: CreateMessageData): Promise<Message> => {
  try {
    const response = await api.post(`/v2/proj/forums/${forumId}/messages/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to post message');
  }
};

/**
 * Update a message
 */
export const updateMessage = async (forumId: string, messageId: string, content: string): Promise<Message> => {
  try {
    const response = await api.patch(`/v2/proj/forums/${forumId}/messages/${messageId}/`, { content });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update message');
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (forumId: string, messageId: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/forums/${forumId}/messages/${messageId}/`);
  } catch (error) {
    throw new Error('Failed to delete message');
  }
};

// ===== THREAD/REPLY FUNCTIONS =====

/**
 * Get all replies to a specific message (thread)
 */
export const getMessageReplies = async (forumId: string, messageId: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/v2/proj/forums/${forumId}/messages/${messageId}/replies/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch message replies');
  }
};

/**
 * Post a reply to a specific message (create thread reply)
 */
export const postMessageReply = async (
  forumId: string, 
  messageId: string, 
  data: { content: string }
): Promise<Message> => {
  try {
    const response = await api.post(`/v2/proj/forums/${forumId}/messages/${messageId}/replies/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to post reply');
  }
};

/**
 * Update a thread reply
 */
export const updateMessageReply = async (
  forumId: string, 
  messageId: string, 
  replyId: string, 
  content: string
): Promise<Message> => {
  try {
    const response = await api.patch(
      `/v2/proj/forums/${forumId}/messages/${messageId}/replies/${replyId}/`, 
      { content }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to update reply');
  }
};

/**
 * Delete a thread reply
 */
export const deleteMessageReply = async (
  forumId: string, 
  messageId: string, 
  replyId: string
): Promise<void> => {
  try {
    await api.delete(`/v2/proj/forums/${forumId}/messages/${messageId}/replies/${replyId}/`);
  } catch (error) {
    throw new Error('Failed to delete reply');
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Search messages in a forum
 */
export const searchForumMessages = async (
  forumId: string, 
  query: string, 
  options?: {
    includeReplies?: boolean;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<APIResponse<Message>> => {
  try {
    const params = new URLSearchParams({
      q: query,
      ...(options?.includeReplies && { include_replies: 'true' }),
      ...(options?.userId && { user_id: options.userId }),
      ...(options?.dateFrom && { date_from: options.dateFrom }),
      ...(options?.dateTo && { date_to: options.dateTo }),
    });

    const response = await api.get(`/v2/proj/forums/${forumId}/messages/search/?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to search messages');
  }
};

/**
 * Get forum statistics
 */
export const getForumStats = async (forumId: string): Promise<{
  totalMessages: number;
  totalReplies: number;
  totalMembers: number;
  activeMembers: number;
  lastActivity: string;
}> => {
  try {
    const response = await api.get(`/v2/proj/forums/${forumId}/stats/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch forum statistics');
  }
};

/**
 * Mark messages as read (for unread count tracking)
 */
export const markMessagesAsRead = async (forumId: string, messageIds: string[]): Promise<void> => {
  try {
    await api.post(`/v2/proj/forums/${forumId}/mark-read/`, { message_ids: messageIds });
  } catch (error) {
    throw new Error('Failed to mark messages as read');
  }
};

/**
 * Get unread message count for a forum
 */
export const getUnreadCount = async (forumId: string): Promise<{ count: number }> => {
  try {
    const response = await api.get(`/v2/proj/forums/${forumId}/unread-count/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch unread count');
  }
};