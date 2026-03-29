"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const HeroSearchInput = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const trimmed = query.trim();
    router.push(trimmed ? `/vagas?q=${encodeURIComponent(trimmed)}` : "/vagas");
  };

  return (
    <div className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
      <span className="text-gray-400" aria-hidden>
        🔍
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar vagas, empresas..."
        aria-label="Buscar vagas"
        className="flex-1 bg-transparent text-sm text-gray-500 placeholder:text-gray-400 outline-none"
      />
    </div>
  );
};
