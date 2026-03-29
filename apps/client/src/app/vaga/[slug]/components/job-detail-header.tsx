"use client";

import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface JobDetailHeaderProps {
  jobTitle: string;
  jobCity: string;
  jobSlug: string;
}

export function JobDetailHeader({
  jobTitle,
  jobCity,
  jobSlug,
}: JobDetailHeaderProps) {
  const router = useRouter();

  const handleShare = () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(
      `${jobTitle} em ${jobCity} — Veja a vaga: https://trabalhalagos.com.br/vaga/${jobSlug}`,
    )}`;
    window.open(shareUrl, "_blank");
  };

  return (
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
        aria-label="Compartilhar via WhatsApp"
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
