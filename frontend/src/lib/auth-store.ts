import { create } from "zustand";

import type { LoginResponse, User } from "@/lib/types";

const SESSION_KEY = "family-hub-web-session";

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: User | null;
};

type AuthState = SessionPayload & {
  setSession: (payload: LoginResponse) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
};

function readSession(): SessionPayload {
  if (typeof window === "undefined") {
    return { accessToken: "", refreshToken: "", user: null };
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return { accessToken: "", refreshToken: "", user: null };
  }

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return { accessToken: "", refreshToken: "", user: null };
  }
}

function writeSession(payload: SessionPayload | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!payload) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

const initialSession = readSession();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initialSession.accessToken ?? "",
  refreshToken: initialSession.refreshToken ?? "",
  user: initialSession.user ?? null,
  setSession: (payload) =>
    set(() => {
      const nextState: SessionPayload = {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      };
      writeSession(nextState);
      return nextState;
    }),
  setUser: (user) =>
    set((state) => {
      const nextState = { ...state, user };
      writeSession({
        accessToken: nextState.accessToken,
        refreshToken: nextState.refreshToken,
        user,
      });
      return nextState;
    }),
  clearSession: () =>
    set(() => {
      writeSession(null);
      return {
        accessToken: "",
        refreshToken: "",
        user: null,
      };
    }),
}));
