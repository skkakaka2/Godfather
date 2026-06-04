import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';

import { authApi } from '../api/auth';
import type { LoginResponse, User } from '../types/domain';

const SESSION_SERVICE = 'family-hub-mobile-session';
const CREDENTIALS_SERVICE = 'family-hub-mobile-credentials';

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: User | null;
};

type Credentials = {
  username: string;
  password: string;
};

type AuthState = SessionPayload & {
  hydrated: boolean;
  isAuthenticated: boolean;
  rememberedUsername: string;
  restoreSession: () => Promise<void>;
  setSession: (payload: LoginResponse) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  clearSession: () => Promise<void>;
  saveCredentials: (username: string, password: string) => Promise<void>;
  getCredentials: () => Promise<Credentials | null>;
  clearCredentials: () => Promise<void>;
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
  rememberedUsername: '',
  restoreSession: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SESSION_SERVICE,
      });
      if (credentials) {
        const session = JSON.parse(credentials.password) as SessionPayload;
        if (session.accessToken) {
          set({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken ?? '',
            user: session.user ?? null,
            hydrated: true,
            isAuthenticated: true,
          });
          return;
        }
      }
    } catch {
      await persistSession(null);
    }

    // session 无效，尝试凭据自动登录
    try {
      const saved = await getCredentialsDirect();
      if (saved) {
        const data = await authApi.login({
          username: saved.username,
          password: saved.password,
        });
        const session: SessionPayload = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        };
        set({...session, hydrated: true, isAuthenticated: true});
        await persistSession(session);
        return;
      }
    } catch {
      await clearCredentialsDirect();
    }

    set({...emptySession, hydrated: true, isAuthenticated: false});
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
  saveCredentials: async (username, password) => {
    await Keychain.setGenericPassword(username, password, {
      service: CREDENTIALS_SERVICE,
    });
    set({rememberedUsername: username});
  },
  getCredentials: async () => {
    try {
      const result = await Keychain.getGenericPassword({
        service: CREDENTIALS_SERVICE,
      });
      if (result) {
        return {username: result.username, password: result.password};
      }
      return null;
    } catch {
      return null;
    }
  },
  clearCredentials: async () => {
    await Keychain.resetGenericPassword({service: CREDENTIALS_SERVICE});
    set({rememberedUsername: ''});
  },
}));

async function getCredentialsDirect() {
  try {
    const result = await Keychain.getGenericPassword({
      service: CREDENTIALS_SERVICE,
    });
    if (result) {
      return {username: result.username, password: result.password};
    }
    return null;
  } catch {
    return null;
  }
}

async function clearCredentialsDirect() {
  await Keychain.resetGenericPassword({service: CREDENTIALS_SERVICE});
}
