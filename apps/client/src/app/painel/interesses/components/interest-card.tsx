"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants/categories.constants";
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

const AVAILABILITY_LABELS: Record<
  NonNullable<Interest["candidateAvailability"]>,
  string
> = {
  IMMEDIATE: "Imediata",
  IN_15_DAYS: "Em 15 dias",
  IN_30_DAYS: "Em 30 dias",
  NEGOTIABLE: "A combinar",
};

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.name]),
);

const CONTRACT_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outro",
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
          <p className="text-sm text-gray-500 break-words">{interest.candidateCity}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                interest.profileBadge === "COMPLETE"
                  ? "bg-success/10 text-success"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {interest.profileBadge === "COMPLETE"
                ? "Perfil completo"
                : "Perfil básico"}
            </span>
            {interest.candidateAvailability && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {AVAILABILITY_LABELS[interest.candidateAvailability]}
              </span>
            )}
            {interest.candidateInterests?.[0] && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-gray-600">
                Área: {CATEGORY_LABELS[interest.candidateInterests[0]] ?? interest.candidateInterests[0]}
              </span>
            )}
            {interest.candidateAcceptedContractTypes?.[0] && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-gray-600">
                Vínculo: {CONTRACT_LABELS[interest.candidateAcceptedContractTypes[0]] ?? interest.candidateAcceptedContractTypes[0]}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Vaga: {interest.jobTitle}
          </p>
          <p className="text-xs text-gray-400">
            {getRelativeTime(interest.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails(interest);
          }}
          className="w-full text-xs"
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
          className="w-full text-xs bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
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
            className="w-full text-xs bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={13} aria-hidden />
            Descartar
          </Button>
        )}
      </div>
    </div>
  );
};
