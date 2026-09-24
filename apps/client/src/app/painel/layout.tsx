"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, PlusCircle, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";
import { cn } from "@/lib/utils/cn.utils";

const PANEL_TABS = [
  { label: "Visão geral", icon: LayoutDashboard, href: "/painel" },
  { label: "Minhas vagas", icon: Briefcase, href: "/painel/vagas" },
  { label: "Nova vaga", icon: PlusCircle, href: "/painel/nova-vaga" },
  { label: "Interesses", icon: Users, href: "/painel/interesses" },
] as const;

const PainelLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isEmployer, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isEmployer) {
      router.replace(isAuthenticated ? "/vagas" : "/login");
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
      className="mx-auto flex min-h-[calc(100dvh-57px)] max-w-7xl flex-col lg:flex-row"
    >
      <nav
        aria-label="Navegação do painel"
        className="sticky top-[57px] z-30 flex overflow-x-auto border-b border-border bg-white lg:top-[57px] lg:h-[calc(100dvh-57px)] lg:w-56 lg:shrink-0 lg:flex-col lg:gap-1 lg:border-r lg:border-b-0 lg:bg-transparent lg:px-3 lg:py-7"
      >
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
                "flex items-center gap-2.5 px-4 py-3 text-sm whitespace-nowrap lg:rounded-xl lg:px-3 lg:py-3",
                isActive
                  ? "border-b-2 border-primary font-semibold text-primary lg:border-b-0 lg:bg-primary/10"
                  : "text-gray-500 hover:bg-white hover:text-gray-900",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1 bg-white px-4 py-6 sm:px-7 lg:min-h-[calc(100dvh-57px)] lg:px-9 lg:py-9">
        {children}
      </div>
    </div>
  );
};

export default PainelLayout;
