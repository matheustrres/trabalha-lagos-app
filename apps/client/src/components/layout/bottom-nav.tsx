"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

const NAV_ITEMS = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Vagas", icon: Briefcase, href: "/vagas" },
  { label: "Empresas", icon: Building2, href: null },
  { label: "Perfil", icon: User, href: null },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white pb-[env(safe-area-inset-bottom,8px)]">
      <div className="max-w-lg mx-auto flex items-center">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive =
            href !== null &&
            (href === "/" ? pathname === "/" : pathname.startsWith(href));
          const isDisabled = href === null;

          const content = (
            <span
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]",
                isActive ? "text-primary font-semibold" : "text-gray-400",
                isDisabled && "cursor-default opacity-40",
              )}
            >
              <Icon size={20} aria-hidden />
              {label}
            </span>
          );

          if (isDisabled)
            return (
              <div key={label} className="flex flex-1 justify-center">
                {content}
              </div>
            );

          return (
            <Link
              key={label}
              href={href}
              className="flex flex-1 justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
