"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, PlusCircle, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";
import { cn } from "@/lib/utils/cn.utils";

const PANEL_TABS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/painel" },
  { label: "Minhas vagas", icon: Briefcase, href: "/painel/vagas" },
  { label: "Nova vaga", icon: PlusCircle, href: "/painel/nova-vaga" },
  { label: "Interesses", icon: Users, href: "/painel/interesses" },
] as const;

const PainelLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isEmployer, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployer)) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isEmployer, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isEmployer) return null;

  return (
    <div
      data-panel-layout
      className="flex min-h-[calc(100dvh-57px)] flex-col bg-white"
    >
      <nav className="sticky top-[57px] z-30 flex overflow-x-auto border-b border-border bg-white">
        {PANEL_TABS.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap",
                isActive
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-gray-400",
              )}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </div>
  );
};

export default PainelLayout;
