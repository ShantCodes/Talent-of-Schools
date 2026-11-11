import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authStore } from '../features/auth/authStore';
import { authApi } from '../features/auth/authApi';
import { refreshSession } from '../lib/api';
import { translate } from '../i18n/I18nContext';
import type { LoginRequest, User } from '../features/auth/types';

export const Roles = { Admin: 'Admin', Student: 'Student', Juror: 'Juror' } as const;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function tokenRoles(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload[roleClaim] ?? payload.role ?? [];
    return Array.isArray(roles) ? roles : [roles];
  } catch {
    return [];
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStore.getUser());
  const [ready, setReady] = useState(() => !authStore.getToken());

  const logout = useCallback(() => {
    authStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('krtakan:logout', logout);
    return () => window.removeEventListener('krtakan:logout', logout);
  }, [logout]);

  useEffect(() => {
    if (!authStore.getToken()) return;
    authApi.me()
      .then(async fresh => {
        // The token's role claim is fixed when it is issued and holds only the user's first role,
        // so after a role change the token must be reissued before the API accepts it.
        const token = authStore.getToken();
        const expected = fresh.roles[0] ?? 'User';
        if (token && !tokenRoles(token).includes(expected)) {
          try { await refreshSession(); } catch { /* the next API call will ask the user to sign in again */ }
        }
        const latest = authStore.get();
        if (latest) authStore.save({ ...latest, user: fresh });
        setUser(fresh);
      })
      .catch(() => { /* keep cached user; api() logs out if the session is gone */ })
      .finally(() => setReady(true));
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    if (!response.user.isApproved) {
      throw new Error(translate('error.pendingApproval'));
    }
    authStore.save(response);
    setUser(response.user);
    return response.user;
  };

  const hasRole = (...roles: string[]) => !!user && user.roles.some(role => roles.includes(role));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
      {ready ? children : <p className="p-10 text-center text-fg-subtle">{translate('common.loading')}</p>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function homePathFor(user: User) {
  if (user.roles.includes(Roles.Admin)) return '/admin/events';
  if (user.roles.includes(Roles.Juror)) return '/jury';
  return '/events';
}
