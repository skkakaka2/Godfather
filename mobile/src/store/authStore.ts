import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';

import type { LoginResponse, User } from '../types/domain';

const SESSION_SERVICE = 'family-hub-mobile-session';

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: User | null;
};

type AuthState = SessionPayload & {
  hydrated: boolean;
  isAuthenticated: boolean;
  restoreSession: () => Promise<void>;
  setSession: (payload: LoginResponse) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  clearSession: () => Promise<void>;
};

const emptySession: SessionPayload = {
  accessToken: '',
  refreshToken: '',
  user: null,
};

async function persistSession(payload: SessionPayload | null) {
  if (!payload) {
    await Keychain.resetGenericPassword({service: SESSION_SERVICE});
    return;
  }

  await Keychain.setGenericPassword(
    'session',
    JSON.stringify(payload),
    {service: SESSION_SERVICE},
  );
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...emptySession,
  hydrated: false,
  isAuthenticated: false,
  restoreSession: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SESSION_SERVICE,
      });
      if (!credentials) {
        set({...emptySession, hydrated: true, isAuthenticated: false});
        return;
      }

      const session = JSON.parse(credentials.password) as SessionPayload;
      set({
        accessToken: session.accessToken ?? '',
        refreshToken: session.refreshToken ?? '',
        user: session.user ?? null,
        hydrated: true,
        isAuthenticated: !!session.accessToken,
      });
    } catch {
      await persistSession(null);
      set({...emptySession, hydrated: true, isAuthenticated: false});
    }
  },
  setSession: async payload => {
    const session: SessionPayload = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    };
    set({...session, isAuthenticated: true});
    await persistSession(session);
  },
  setUser: async user => {
    const nextSession: SessionPayload = {
      accessToken: get().accessToken,
      refreshToken: get().refreshToken,
      user,
    };
    set(nextSession);
    await persistSession(nextSession);
  },
  clearSession: async () => {
    set({...emptySession, isAuthenticated: false});
    await persistSession(null);
  },
}));
