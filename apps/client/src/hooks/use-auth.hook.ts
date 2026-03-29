"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import type { Session } from "@/lib/auth";

export const useAuth = () => {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setSessionState(getSession());
    setIsLoading(false);
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
    isEmployer: session?.role === "EMPLOYER",
    logout,
  };
};
