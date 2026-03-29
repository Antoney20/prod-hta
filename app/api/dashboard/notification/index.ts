import api from '@/app/api/auth';
import { AlertsResponse } from '@/types/new/notification';


const NOTIFICATIONS_ENDPOINT = '/v2/notifications/alerts/';

export const getAlerts = async (): Promise<AlertsResponse> => {
  try {
    const response = await api.get<AlertsResponse>(NOTIFICATIONS_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch alerts');
  }
};