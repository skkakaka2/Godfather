import {get, put} from './client';
import type {User} from '../types/domain';

export const userApi = {
  me() {
    return get<User>('/api/v1/users/me');
  },
  familyMembers() {
    return get<User[]>('/api/v1/users/family/members');
  },
  updateUser(id: string, data: {nickname?: string; avatar?: string; role?: string}) {
    return put<User>(`/api/v1/users/${id}`, null, {params: data});
  },
  changePassword(data: {currentPassword: string; newPassword: string}) {
    return put<void>('/api/v1/users/me/password', data);
  },
};
