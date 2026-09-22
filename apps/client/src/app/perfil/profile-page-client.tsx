"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.hook";
import { ProfileForm } from "./components/profile-form";
import { AccountSettings } from "./components/account-settings";

export const ProfilePageClient = () => {
  const { isLoading, isAuthenticated, session } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"conta" | "profissional">("conta");
  const isCandidate = session?.user.role === "CANDIDATE";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const requestedTab = new URLSearchParams(window.location.search).get("aba");
    const tab = requestedTab === "profissional" && isCandidate ? "profissional" : "conta";
    setActiveTab(tab);

    if (requestedTab !== tab) {
      router.replace(`/perfil?aba=${tab}`, { scroll: false });
    }
  }, [isLoading, isAuthenticated, isCandidate, router]);

  const selectTab = (tab: "conta" | "profissional") => {
    setActiveTab(tab);
    router.replace(`/perfil?aba=${tab}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div data-profile-layout className="min-h-[40vh] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Carregando perfil...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const roleLabel = session?.user.role === "EMPLOYER" ? "Empregador" : "Candidato";
  const initials = session?.user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div data-profile-layout className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold text-gray-900">Meu perfil</h1>
          <p className="truncate text-sm text-gray-500">{session?.user.name} · {roleLabel}</p>
          <p className="truncate text-xs text-gray-400">{session?.user.email}</p>
        </div>
      </div>

      {isCandidate && (
        <div role="tablist" aria-label="Seções do perfil" className="mt-6 flex border-b border-border">
          <button
            id="tab-conta"
            type="button"
            role="tab"
            aria-selected={activeTab === "conta"}
            aria-controls="panel-conta"
            onClick={() => selectTab("conta")}
            className={`flex-1 border-b-2 px-3 py-3 text-sm font-medium ${activeTab === "conta" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
          >Conta</button>
          <button
            id="tab-profissional"
            type="button"
            role="tab"
            aria-selected={activeTab === "profissional"}
            aria-controls="panel-profissional"
            onClick={() => selectTab("profissional")}
            className={`flex-1 border-b-2 px-3 py-3 text-sm font-medium ${activeTab === "profissional" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
          >Perfil profissional</button>
        </div>
      )}

      <section id="panel-conta" role={isCandidate ? "tabpanel" : undefined} aria-labelledby={isCandidate ? "tab-conta" : undefined} hidden={isCandidate && activeTab !== "conta"} className="mt-5">
        {!isCandidate && <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">Conta</h2>}
        <AccountSettings />
      </section>
      {isCandidate && (
        <section id="panel-profissional" role="tabpanel" aria-labelledby="tab-profissional" hidden={activeTab !== "profissional"} className="mt-5">
          <ProfileForm />
        </section>
      )}
    </div>
  );
};
