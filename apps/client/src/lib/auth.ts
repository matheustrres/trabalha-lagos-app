export interface Session {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city?: string | null;
    role: "CANDIDATE" | "EMPLOYER";
  };
}

export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const SESSION_CHANGE_EVENT = "session-change";

export const setSession = (session: Session): void => {
  localStorage.setItem("session", JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT));
};

export const clearSession = (): void => {
  localStorage.removeItem("session");
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

export const isEmployer = (): boolean => {
  return getSession()?.user.role === "EMPLOYER";
};
