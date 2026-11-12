import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { api, ApiError, useMockApi } from "../api/index.ts";
import type { AuthMe } from "../api/types.ts";

type AuthValue = {
  user: AuthMe | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
    retry: false,
  });

  useEffect(() => {
    if (!useMockApi) void api.ensureCsrf().catch(() => undefined);
  }, []);

  const loggedOut = me.error instanceof ApiError && me.error.status === 401;
  const value = {
    user: me.data ?? null,
    loading: me.isLoading && !loggedOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
