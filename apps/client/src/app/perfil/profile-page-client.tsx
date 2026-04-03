"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.hook";
import { ProfileForm } from "./components/profile-form";

export const ProfilePageClient = () => {
  const { isLoading, isAuthenticated, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (session?.user.role !== "CANDIDATE") {
      router.replace("/painel");
    }
  }, [isLoading, isAuthenticated, router, session?.user.role]);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Carregando perfil...</p>
      </div>
    );
  }

  if (!isAuthenticated || session?.user.role !== "CANDIDATE") return null;

  return <ProfileForm />;
};
