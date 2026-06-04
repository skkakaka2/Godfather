import {post} from './client';
import type {LoginPayload, LoginResponse} from '../types/domain';

export const authApi = {
  login(payload: LoginPayload) {
    return post<LoginResponse>('/api/v1/auth/login', payload);
  },
  register(payload: {
    username: string;
    password: string;
    nickname?: string;
    role?: string;
    familyId?: string;
  }) {
    return post<LoginResponse>('/api/v1/auth/register', payload);
  },
};
