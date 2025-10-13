export interface UserType {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

export interface ChannelMembership {
  id: string;
  channel: string;
  user: UserType;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  channel: string;
  user: UserType;
  content: string;
  created_at: string;
  updated_at: string;
  // Thread support
  parent_message?: Message | null;
  reply_count: number;
  is_thread_reply: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_by: UserType;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  members: UserType[];
  memberships: ChannelMembership[];
  messages: Message[];
}

export interface CreateChannelData {
  name: string;
  description?: string;
  is_private: boolean;
}

export interface CreateMessageData {
  content: string;
  parent_message_id?: string; // For thread replies
}

export interface AddMemberData {
  user_id: string;
  role?: 'member' | 'moderator';
}

export interface APIResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Utility type for handling different API response formats
export type APIData<T> = T[] | APIResponse<T>;

// Helper function to normalize API responses
export function normalizeAPIResponse<T>(data: APIData<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

// Message grouping types for better chat organization
export interface MessageGroup {
  user: UserType;
  messages: Message[];
  timestamp: string;
}

// Thread-specific types
export interface ThreadReply {
  id: string;
  user: UserType;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessageThread {
  parent_message: Message;
  replies: ThreadReply[];
  reply_count: number;
}

// Forum statistics interface
export interface ForumStats {
  totalMessages: number;
  totalMembers: number;
  activeMembers: number;
  lastActivity: string;
}

// Extended forum interface with computed properties
export interface ForumWithStats extends Channel {
  stats: ForumStats;
  currentUserRole?: 'owner' | 'moderator' | 'member';
  unreadCount?: number;
}

// Component prop types
export interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onShowThread?: (message: Message) => void;
}

export interface MessageInputProps {
  onSendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export interface ThreadViewProps {
  parentMessage: Message;
  replies: ThreadReply[];
  onSendReply: (content: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}