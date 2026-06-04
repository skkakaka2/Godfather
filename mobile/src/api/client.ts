import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';

import {API_BASE_URL} from '../config/env';
import {useAuthStore} from '../store/authStore';
import type {ApiResponse} from '../types/domain';

const SUCCESS_CODE = 200;

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

http.interceptors.request.use(config => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const payload = response.data;
    if (typeof payload?.code === 'number') {
      if (payload.code === SUCCESS_CODE) {
        return payload.data as never;
      }
      return Promise.reject(new Error(payload.message || '请求失败'));
    }
    return response.data as never;
  },
  error => {
    const responseData = error.response?.data as {message?: string} | undefined;
    const message = responseData?.message || error.message || '网络异常，请稍后重试';
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession().catch(() => undefined);
    }
    return Promise.reject(new Error(message));
  },
);

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return http.get<unknown, T>(url, config);
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) {
  return http.post<unknown, T>(url, data, config);
}

export function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) {
  return http.put<unknown, T>(url, data, config);
}

export function remove<T>(url: string, config?: AxiosRequestConfig) {
  return http.delete<unknown, T>(url, config);
}
