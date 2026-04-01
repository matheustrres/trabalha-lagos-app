import { api } from "@/lib/api";

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  city: string;
  role: "CANDIDATE" | "EMPLOYER";
  document?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    city?: string | null;
    role: "CANDIDATE" | "EMPLOYER";
  };
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),
};
