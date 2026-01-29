import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, LoginForm, RegisterForm } from "@/shared/types";
import * as authApi from "@/react-app/lib/authApi";
import { isSupabaseConfigured, supabase } from "@/react-app/lib/supabase";
import * as authSupabase from "@/react-app/lib/authSupabase";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void | Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setUser = useCallback((user: User | null) => {
    setState({
      user,
      token: user ? "supabase" : null,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      authSupabase.getSessionSupabase().then(setUser);
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user?.email) {
            const u = await authSupabase.getSessionSupabase();
            setUser(u);
          } else {
            setUser(null);
          }
        }
      );
      return () => subscription.unsubscribe();
    }
    const session = authApi.getStoredSession();
    if (session) {
      setState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((s) => ({ ...s, user: null, token: null, isAuthenticated: false, isLoading: false }));
    }
  }, [setUser]);

  const login = useCallback(
    async (credentials: LoginForm) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        if (isSupabaseConfigured) {
          const user = await authSupabase.loginSupabase(credentials);
          setState({ user, token: "supabase", isAuthenticated: true, isLoading: false });
        } else {
          const session = await authApi.login(credentials);
          authApi.persistSession(session);
          setState({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterForm) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        if (isSupabaseConfigured) {
          const user = await authSupabase.registerSupabase(data);
          setState({ user, token: "supabase", isAuthenticated: true, isLoading: false });
        } else {
          const session = await authApi.register(data);
          authApi.persistSession(session);
          setState({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    if (isSupabaseConfigured) {
      authSupabase.logoutSupabase();
    } else {
      authApi.clearStoredSession();
    }
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (isSupabaseConfigured) {
      await authSupabase.updateUserSupabase(updatedUser);
    } else {
      authApi.updateUser(updatedUser);
    }
    setState((s) => (s.user ? { ...s, user: updatedUser } : s));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
