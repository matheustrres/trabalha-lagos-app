import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-surface px-4 py-10">
    <div className="flex w-full max-w-md flex-col items-center">
      <Link
        href="/"
        aria-label="TrabalhaLagos — página inicial"
        className="mb-6 rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:outline-none"
      >
        <BrandLogo variant="full" priority />
      </Link>
      <div className="w-full">{children}</div>
    </div>
  </div>
);

export default AuthLayout;
