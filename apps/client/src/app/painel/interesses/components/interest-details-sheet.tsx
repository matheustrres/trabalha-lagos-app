"use client";

import { MessageCircle } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Interest } from "@/types/interest.types";

interface InterestDetailsSheetProps {
  interest: Interest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Interest["status"]) => void;
  isUpdating?: boolean;
}

export const InterestDetailsSheet = ({
  interest,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating = false,
}: InterestDetailsSheetProps) => {
  if (!interest) return null;

  const formattedDate = new Date(interest.createdAt).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const hasPhone = Boolean(interest.candidatePhone);

  const handleWhatsApp = () => {
    if (!interest.candidatePhone || isUpdating) return;

    window.open(`https://wa.me/${interest.candidatePhone}`, "_blank");
  };

  const handleDiscard = () => {
    if (isUpdating || interest.status === "REJECTED") return;

    if (window.confirm("Tem certeza que deseja descartar este interesse?")) {
      onStatusChange(interest.id, "REJECTED");
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Detalhes do interesse">
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-gray-400">Candidato</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {interest.candidateName}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{interest.candidateCity}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            WhatsApp: {hasPhone ? interest.candidatePhone : "Disponível no plano Pro"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-gray-400">Vaga</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{interest.jobTitle}</p>
          <p className="text-xs text-gray-500 mt-1">Interesse enviado em {formattedDate}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="whatsapp"
            size="sm"
            onClick={handleWhatsApp}
            disabled={!hasPhone || isUpdating}
            title={!hasPhone ? "Disponível no plano Pro" : undefined}
            className="flex-1"
          >
            <MessageCircle size={14} aria-hidden />
            Abrir WhatsApp
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">
            Fechar
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleDiscard}
          disabled={isUpdating || interest.status === "REJECTED"}
          className="w-full text-gray-600"
        >
          Descartar interesse
        </Button>
      </div>
    </BottomSheet>
  );
};
