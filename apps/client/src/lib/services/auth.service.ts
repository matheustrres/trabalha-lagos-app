import { api } from "@/lib/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  city: string;
  role: "CANDIDATE" | "EMPLOYER";
  phone?: string;
  document?: string;
  companyName?: string;
  segment?: string;
  companyWhatsapp?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
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

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<AuthResponse>("/auth/password", data),
};
