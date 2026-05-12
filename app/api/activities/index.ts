import api from "../auth";
import type {
  Activity,
  SubActivity,
  ActivityWritePayload,
  SubActivityWritePayload,
  ActivityApiResult,
} from "@/types/new/activity";


interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const ok = <T>(data: T): ActivityApiResult<T> => ({ data, error: null, ok: true });
const err = <T>(e: unknown): ActivityApiResult<T> => ({
  data: null,
  error: (e as any)?.response?.data?.message ?? "Something went wrong.",
  ok: false,
});

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const res = await api.get<Envelope<Activity[]>>("/v3/activities/");
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const createActivity = async (
  body: ActivityWritePayload
): Promise<ActivityApiResult<Activity>> => {
  try {
    const res = await api.post<Envelope<Activity>>("/v3/activities/", body);
    return ok(res.data.data);
  } catch (e) {
    return err(e);
  }
};

export const deleteActivity = async (
  id: number
): Promise<ActivityApiResult<null>> => {
  try {
    await api.delete(`/v3/activities/${id}/`);
    return ok(null);
  } catch (e) {
    return err(e);
  }
};


export const getSubActivities = async (): Promise<SubActivity[]> => {
  try {
    const res = await api.get<Envelope<SubActivity[]>>("/v3/sub-activities/");
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const createSubActivity = async (
  body: SubActivityWritePayload
): Promise<ActivityApiResult<SubActivity>> => {
  try {
    const res = await api.post<Envelope<SubActivity>>("/v3/sub-activities/", body);
    return ok(res.data.data);
  } catch (e) {
    return err(e);
  }
};

export const updateSubActivity = async (
  id: number,
  body: Partial<SubActivityWritePayload>
): Promise<ActivityApiResult<SubActivity>> => {
  try {
    const res = await api.patch<Envelope<SubActivity>>(`/v3/sub-activities/${id}/`, body);
    return ok(res.data.data);
  } catch (e) {
    return err(e);
  }
};

export const deleteSubActivity = async (
  id: number
): Promise<ActivityApiResult<null>> => {
  try {
    await api.delete(`/v3/sub-activities/${id}/`);
    return ok(null);
  } catch (e) {
    return err(e);
  }
};

export const markSubActivityComplete = async (
  id: number
): Promise<ActivityApiResult<SubActivity>> => {
  try {
    const res = await api.patch<Envelope<SubActivity>>(`/v3/sub-activities/${id}/complete/`);
    return ok(res.data.data);
  } catch (e) {
    return err(e);
  }
};