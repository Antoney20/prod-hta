
import type { Member } from "@/types/dashboard/members";
import { ISODateString } from "./shared";

export type UrgencyLevel = "low" | "medium" | "high" | "urgent";
export type ActivityStatus = "pending" | "in_progress" | "completed" | "cancelled";


export interface Activity {
  id: number;
  name: string;
  urgency: UrgencyLevel;
  notes: string;
  created_at: ISODateString;
  created_by: number | null;
}

export interface ActivityWritePayload {
  name: string;
  urgency: UrgencyLevel;
  notes?: string;
}

export interface SubActivity {
  id: number;
  hta_id: string;
  activity: number;
  name: string;
  urgency: UrgencyLevel;
  start_date: ISODateString | null;
  end_date: ISODateString | null;
  assigned_to: number[];
  status: ActivityStatus;
  notes: string;
  send_email_alert: boolean;
  completed_at: ISODateString | null;
  completed_by: number | null;
  created_at: ISODateString;
}

export interface SubActivityWritePayload {
  activity: number;
  name: string;
  urgency?: UrgencyLevel;
  start_date?: string | null;
  end_date?: string | null;
  assigned_to?: number[];
  status?: ActivityStatus;
  notes?: string;
  send_email_alert?: boolean;
}


export interface SubActivityHydrated extends Omit<SubActivity, "assigned_to" | "completed_by"> {
  assigned_to_users: Member[];
  completed_by_user: Member | null;
}

export interface ActivityWithSubs extends Activity {
  sub_activities: SubActivity[];
}


export interface ActivityApiResult<T> {
  data: T | null;
  error: string | null;
  ok: boolean;
}