"use client";

import { MessageCircle, Eye, X } from "lucide-react";
import type { Interest } from "@/types/interest.types";

const STATUS_CONFIG: Record<
  Interest["status"],
  { label: string; className: string }
> = {
  SENT: { label: "Novo", className: "bg-blue-500/10 text-blue-500" },
  VIEWED: {
    label: "Visualizado",
    className: "bg-yellow-500/10 text-yellow-600",
  },
  CONTACTED: { label: "Contatado", className: "bg-success/10 text-success" },
  REJECTED: { label: "Descartado", className: "bg-gray-100 text-gray-400" },
};

const getRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
};

interface InterestCardProps {
  interest: Interest;
  onStatusChange: (id: string, status: Interest["status"]) => void;
}

export const InterestCard = ({
  interest,
  onStatusChange,
}: InterestCardProps) => {
  const { label, className } = STATUS_CONFIG[interest.status];
  const initial = interest.candidateName.charAt(0).toUpperCase();

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${interest.candidatePhone}`, "_blank");
    if (interest.status !== "CONTACTED") {
      onStatusChange(interest.id, "CONTACTED");
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Tem certeza que deseja descartar este candidato?")) {
      onStatusChange(interest.id, "REJECTED");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">{initial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 truncate">
              {interest.candidateName}
            </p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
            >
              {label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{interest.candidateCity}</p>
          <p className="text-xs text-gray-400 mt-1">
            Vaga: {interest.jobTitle}
          </p>
          <p className="text-xs text-gray-400">
            {getRelativeTime(interest.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366]"
        >
          <MessageCircle size={13} aria-hidden />
          WhatsApp
        </button>

        {interest.status === "SENT" && (
          <button
            onClick={() => onStatusChange(interest.id, "VIEWED")}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500"
          >
            <Eye size={13} aria-hidden />
            Visualizado
          </button>
        )}

        {interest.status !== "REJECTED" && (
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400"
          >
            <X size={13} aria-hidden />
            Descartar
          </button>
        )}
      </div>
    </div>
  );
};
