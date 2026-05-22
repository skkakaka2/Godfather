import {get, post} from './client';
import type {DailyTask, DailyTaskFilter} from '../types/domain';

export const taskApi = {
  list(filters: DailyTaskFilter = {}) {
    return get<DailyTask[]>('/api/v1/tasks', {params: filters});
  },
  complete(id: string, userId: string) {
    return post<void>('/api/v1/tasks/complete', {id, userId});
  },
  confirm(id: string, points?: number, remark?: string) {
    return post<void>('/api/v1/tasks/confirm', {id, points, remark});
  },
  reject(id: string, reason: string) {
    return post<void>('/api/v1/tasks/reject', {id, reason});
  },
};
