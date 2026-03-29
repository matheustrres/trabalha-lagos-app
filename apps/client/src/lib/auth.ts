export interface Session {
  token: string;
  role: "CANDIDATE" | "EMPLOYER";
  name: string;
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

export const setSession = (session: Session): void => {
  localStorage.setItem("session", JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem("session");
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

export const isEmployer = (): boolean => {
  return getSession()?.role === "EMPLOYER";
};
