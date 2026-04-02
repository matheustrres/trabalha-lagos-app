"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onOpenDetails: (interest: Interest) => void;
  isUpdating?: boolean;
}

export const InterestCard = ({
  interest,
  onStatusChange,
  onOpenDetails,
  isUpdating = false,
}: InterestCardProps) => {
  const { label, className } = STATUS_CONFIG[interest.status];
  const initial = interest.candidateName.charAt(0).toUpperCase();

  const whatsappDisabled = !interest.candidatePhone || isUpdating;

  const handleWhatsApp = () => {
    if (!interest.candidatePhone || isUpdating) return;

    window.open(`https://wa.me/${interest.candidatePhone}`, "_blank");
  };

  const handleDiscard = () => {
    if (isUpdating) return;

    if (window.confirm("Tem certeza que deseja descartar este candidato?")) {
      onStatusChange(interest.id, "REJECTED");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(interest)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(interest);
        }
      }}
      className="bg-white rounded-2xl border border-border p-4 transition-opacity duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`Ver detalhes de ${interest.candidateName}`}
    >
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails(interest);
          }}
          className="text-xs"
        >
          Ver detalhes
        </Button>

        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleWhatsApp();
          }}
          disabled={whatsappDisabled}
          variant="ghost"
          size="sm"
          title={!interest.candidatePhone ? "Disponível no plano Pro" : undefined}
          className="text-xs bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
        >
          <MessageCircle size={13} aria-hidden />
          Abrir WhatsApp
        </Button>

        {interest.status !== "REJECTED" && (
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDiscard();
            }}
            disabled={isUpdating}
            variant="ghost"
            size="sm"
            className="text-xs bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={13} aria-hidden />
            Descartar
          </Button>
        )}
      </div>
    </div>
  );
};
