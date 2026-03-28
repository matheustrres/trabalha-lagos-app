import Link from "next/link";

export const Header = () => (
  <header className="border-b border-border bg-white px-4 py-3">
    <div className="max-w-lg mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5">
        <span aria-hidden>⚡</span>
        <span className="font-display text-lg font-bold text-gray-900">
          TrabalhaLagos
        </span>
      </Link>
    </div>
  </header>
);
