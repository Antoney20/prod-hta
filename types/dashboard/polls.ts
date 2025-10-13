export interface PollOption {
  id: string;
  text: string;
  vote_count?: number;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  channel: string;
  is_anonymous: boolean;
  allow_multiple_choices: boolean;
  allow_comments: boolean;
  expires_at?: string;
  created_by: string;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  is_active?: boolean;
  is_owner?: boolean; // Added: Backend returns this based on JWT
}

export interface PollResults {
  poll_id: string;
  question: string;
  total_votes: number;
  user_has_voted: boolean;
  is_active: boolean;
  options: Array<{
    id: string;
    text: string;
    vote_count: number;
  }>;
}

export interface DetailedVote {
  timestamp: string;
  username: string;
  vote: string;
  comment: string;
}

export interface VoteAnalytics {
  total_votes: number;
  unique_voters: number;
  votes_by_option: {
    [optionText: string]: Array<{
      username: string;
      voted_at: string;
    }>;
  };
  detailed_votes: DetailedVote[]; // Added: Structured data for table/CSV
}

export interface PollComment {
  id: string;
  user: {
    id: string;
    username: string;
  };
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePollData {
  question: string;
  description?: string;
  channel: string;
  is_anonymous?: boolean;
  allow_multiple_choices?: boolean;
  allow_comments?: boolean;
  expires_at?: string;
  options: Array<{ text: string }>;
}

export interface VoteData {
  option_id: string;
}

export interface CommentData {
  content: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}