import {get, post, put, remove} from './client';
import type {Activity} from '../types/domain';

export type ActivityPayload = {
  name: string;
  description?: string;
  bannerImage?: string;
  type: string;
  startTime: string;
  endTime: string;
  discountRate?: number;
  rewardName?: string;
  rewardImage?: string;
  rewardPointsPrice?: number;
  rewardDescription?: string;
  rewardStock?: number;
  bonusType?: string;
  bonusMultiplier?: number;
};

export const activityApi = {
  getActiveActivities() {
    return get<Activity[]>('/api/v1/activities/active');
  },
  getActivityDetail(id: string) {
    return get<Activity>(`/api/v1/activities/${id}`);
  },
  list(params: {type?: string; status?: string} = {}) {
    return get<Activity[]>('/api/v1/activities', {params});
  },
  create(payload: ActivityPayload) {
    return post<Activity>('/api/v1/activities', payload);
  },
  update(id: string, payload: Partial<ActivityPayload>) {
    return put<Activity>(`/api/v1/activities/${id}`, payload);
  },
  delete(id: string) {
    return remove<void>(`/api/v1/activities/${id}`);
  },
  toggle(id: string) {
    return put<void>(`/api/v1/activities/${id}/toggle`);
  },
};
