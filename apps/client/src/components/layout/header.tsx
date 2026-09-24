"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useAuth } from "@/hooks/use-auth.hook";

export const Header = () => {
  const pathname = usePathname();
  const { session, isAuthenticated, isLoading, logout } = useAuth();

  if (pathname === "/login" || pathname === "/cadastro") return null;

  const firstName = session?.user.name.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white px-4 py-3">
      <div
        className={`${pathname.startsWith("/painel") ? "max-w-7xl" : "max-w-lg"} mx-auto flex items-center justify-between`}
      >
        <Link
          href="/"
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <BrandLogo priority />
        </Link>

        {!isLoading &&
          (isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/perfil?aba=conta"
                className="flex items-center gap-1.5 rounded-lg text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <UserCircle size={18} aria-hidden />
                {firstName}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-primary">
              Entrar
            </Link>
          ))}
      </div>
    </header>
  );
};
