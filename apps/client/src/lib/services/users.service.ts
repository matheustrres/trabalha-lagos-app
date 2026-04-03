import { api } from "@/lib/api";
import type {
  UpdateUserProfilePayload,
  UserProfile,
} from "@/types/user-profile.types";

export const usersService = {
  getMyProfile: () => api.get<UserProfile>("/users/me/profile"),
  updateMyProfile: (data: UpdateUserProfilePayload) =>
    api.patch<UserProfile>("/users/me/profile", data),
};
