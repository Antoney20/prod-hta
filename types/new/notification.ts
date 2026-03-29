export type AlertSeverity = 'high' | 'warning';
export type AlertType = 'login_failure' | 'task_expiry';

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  detail: string;
  timestamp: string | null;
  action_url: string;
  task_id?: string;
}

export interface AlertsResponse {
  count: number;
  alerts: Alert[];
}