"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobDetailHeaderProps {
  jobSlug: string;
}

export function JobDetailHeader({ jobSlug }: JobDetailHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const jobUrl = `${window.location.origin}/vaga/${jobSlug}`;

    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link da vaga:", jobUrl);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="text-gray-600 hover:text-gray-900 transition-colors text-lg"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-gray-800">
          Detalhes da vaga
        </span>
        <button
          onClick={handleShare}
          aria-label="Copiar link da vaga"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {copied ? <Check size={18} /> : <Share2 size={18} />}
        </button>
      </div>

      {copied && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-success px-3 py-2 text-xs font-medium text-white shadow-lg">
          Link da vaga copiado com sucesso para a área de transferência.
        </div>
      )}
    </>
  );
}
