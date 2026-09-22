import { api } from "@/lib/api";
import type {
  UpdateUserProfilePayload,
  UserProfile,
} from "@/types/user-profile.types";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  city: string | null;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN";
}

export interface UpdateAccountPayload {
  name: string;
  city: string;
}

export const usersService = {
  getMyAccount: () => api.get<UserAccount>("/users/me"),
  updateMyAccount: (data: UpdateAccountPayload) =>
    api.patch<UserAccount>("/users/me", data),
  deleteMyAccount: (data: { currentPassword: string; confirmation: string }) =>
    api.delete<void>("/users/me", data),
  getMyProfile: () => api.get<UserProfile>("/users/me/profile"),
  updateMyProfile: (data: UpdateUserProfilePayload) =>
    api.patch<UserProfile>("/users/me/profile", data),
};
