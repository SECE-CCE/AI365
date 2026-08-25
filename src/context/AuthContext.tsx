import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiFetch } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<User>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('ai365_session_id'));

  const refreshUser = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, role: string): Promise<User> => {
    const data = await apiFetch<{ user: User; token: string; sessionId?: number }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    setUser(data.user);
    if (data.sessionId) {
      setSessionId(String(data.sessionId));
      localStorage.setItem('ai365_session_id', String(data.sessionId));
    }
    return data.user;
  };

  const register = async (formData: any): Promise<any> => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    return data;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout', { 
        method: 'POST',
        body: sessionId ? JSON.stringify({ sessionId }) : undefined
      });
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('ai365_session_id');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let idleTimeout: NodeJS.Timeout;

    const handleBeforeUnload = () => {
      if (sessionId) {
        const data = JSON.stringify({ sessionId });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/auth/logout', blob);
      }
    };

    const resetIdleTimeout = () => {
      clearTimeout(idleTimeout);
      // 15 minutes of inactivity logs the student out
      idleTimeout = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    if (user && user.role === 'student' && sessionId) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('mousemove', resetIdleTimeout);
      window.addEventListener('keydown', resetIdleTimeout);
      window.addEventListener('click', resetIdleTimeout);
      window.addEventListener('scroll', resetIdleTimeout);

      resetIdleTimeout();

      interval = setInterval(async () => {
        try {
          await apiFetch('/api/auth/session', {
            method: 'PUT',
            body: JSON.stringify({ sessionId }),
          });
        } catch (err) {
          // silent fail
        }
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (idleTimeout) clearTimeout(idleTimeout);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousemove', resetIdleTimeout);
      window.removeEventListener('keydown', resetIdleTimeout);
      window.removeEventListener('click', resetIdleTimeout);
      window.removeEventListener('scroll', resetIdleTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionId]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
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
