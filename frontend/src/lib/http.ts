import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

import { useAuthStore } from "@/lib/auth-store";
import type { ApiResponse } from "@/lib/types";

const SUCCESS_CODE = 200;

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  timeout: 12_000,
});

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const payload = response.data;
    if (typeof payload?.code === "number") {
      if (payload.code === SUCCESS_CODE) {
        return payload.data;
      }
      return Promise.reject(new Error(payload.message || "请求失败"));
    }
    return response.data;
  },
  (error) => {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;
    const message =
      responseData?.message || error.message || "网络异常，请稍后重试";
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
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
