import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { User } from '../types';
import { apiFetch } from '../services/api';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes (1 hour) session inactivity timeout

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<User>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('ai365_session_id')
  );

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  /**
   * Clear the inactivity timer.
   */
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  /**
   * Logout the current user and invalidate the backend session.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: sessionId
          ? JSON.stringify({ sessionId })
          : undefined,
      });
    } catch (err) {
      // Ignore logout API errors.
    } finally {
      clearInactivityTimer();
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('ai365_session_id');
    }
  }, [sessionId, clearInactivityTimer]);

  /**
   * Handle backend session expiration.
   */
  const handleSessionExpired = useCallback(() => {
    clearInactivityTimer();

    setUser(null);
    setSessionId(null);
    localStorage.removeItem('ai365_session_id');

    const currentPath = window.location.pathname;

    if (
      !currentPath.startsWith('/login') &&
      !currentPath.startsWith('/register') &&
      currentPath !== '/'
    ) {
      window.location.href = '/login?session_expired=true';
    }
  }, [clearInactivityTimer]);

  /**
   * Reset inactivity timer whenever the user performs an activity.
   */
  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();

    if (!user) {
      return;
    }

    inactivityTimerRef.current = setTimeout(async () => {
      await logout();
      handleSessionExpired();
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, logout, handleSessionExpired, clearInactivityTimer]);

  /**
   * Fetch the currently authenticated user.
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('ai365_session_id');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Restore authentication state when the application starts.
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Track user activity and enforce inactivity timeout.
   */
  useEffect(() => {
    if (!user) {
      clearInactivityTimer();
      return;
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, {
        passive: true,
      });
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      clearInactivityTimer();
    };
  }, [user, resetInactivityTimer, clearInactivityTimer]);

  /**
   * Listen for a 401/session-expired event from apiFetch.
   */
  useEffect(() => {
    const onSessionExpired = () => {
      handleSessionExpired();
    };

    window.addEventListener(
      'ai365_session_expired',
      onSessionExpired
    );

    return () => {
      window.removeEventListener(
        'ai365_session_expired',
        onSessionExpired
      );
    };
  }, [handleSessionExpired]);

  /**
   * Login.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
      role: string
    ): Promise<User> => {
      const data = await apiFetch<{
        user: User;
        token?: string;
        sessionId?: number | string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      setUser(data.user);

      if (data.sessionId !== undefined && data.sessionId !== null) {
        const id = String(data.sessionId);

        setSessionId(id);
        localStorage.setItem('ai365_session_id', id);
      }

      return data.user;
    },
    []
  );

  /**
   * Register a new user.
   */
  const register = useCallback(
    async (formData: any): Promise<any> => {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      return data;
    },
    []
  );

  /**
   * Student session heartbeat + browser unload handling.
   */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleBeforeUnload = () => {
      if (!sessionId) {
        return;
      }

      const data = JSON.stringify({
        sessionId,
      });

      const blob = new Blob([data], {
        type: 'application/json',
      });

      navigator.sendBeacon('/api/auth/logout', blob);
    };

    if (user && user.role === 'student' && sessionId) {
      window.addEventListener(
        'beforeunload',
        handleBeforeUnload
      );

      /**
       * Update the backend session every 60 seconds.
       */
      interval = setInterval(async () => {
        try {
          await apiFetch('/api/auth/session', {
            method: 'PUT',
            body: JSON.stringify({
              sessionId,
            }),
          });
        } catch (err) {
          // Silent failure.
        }
      }, 60_000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }

      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
    };
  }, [user, sessionId]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
