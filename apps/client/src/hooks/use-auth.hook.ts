"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession, setSession, SESSION_CHANGE_EVENT } from "@/lib/auth";
import type { Session } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.exp as number) * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const useAuth = () => {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const syncSession = useCallback(() => {
    const stored = getSession();
    if (!stored) {
      setSessionState(null);
      setIsLoading(false);
      return;
    }
    if (isTokenExpired(stored.accessToken)) {
      authService
        .refresh(stored.refreshToken)
        .then((refreshed) => {
          setSession(refreshed);
          setSessionState(refreshed);
        })
        .catch(() => {
          clearSession();
          setSessionState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSessionState(stored);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSession();
    window.addEventListener(SESSION_CHANGE_EVENT, syncSession);
    return () => window.removeEventListener(SESSION_CHANGE_EVENT, syncSession);
  }, [syncSession]);

  const refresh = useCallback(async () => {
    const stored = getSession();
    if (!stored) return;
    try {
      const refreshed = await authService.refresh(stored.refreshToken);
      setSession(refreshed);
      setSessionState(refreshed);
    } catch {
      clearSession();
      setSessionState(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    router.push("/");
  }, [router]);

  return {
    session,
    isLoading,
    isAuthenticated: session !== null,
    isEmployer: session?.user.role === "EMPLOYER",
    logout,
    refresh,
  };
};
