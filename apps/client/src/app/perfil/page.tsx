import type { Metadata } from "next";
import { ProfilePageClient } from "./profile-page-client";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Complete seu perfil para se destacar nas vagas.",
};

const ProfilePage = () => <ProfilePageClient />;

export default ProfilePage;
