"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CATEGORIES } from "@/lib/constants/categories.constants";
import type { Interest } from "@/types/interest.types";

interface InterestDetailsSheetProps {
  interest: Interest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Interest["status"]) => void;
  isUpdating?: boolean;
}

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.name]),
);

const AVAILABILITY_LABELS: Record<
  NonNullable<Interest["candidateAvailability"]>,
  string
> = {
  IMMEDIATE: "Imediata",
  IN_15_DAYS: "Em 15 dias",
  IN_30_DAYS: "Em 30 dias",
  NEGOTIABLE: "A combinar",
};

const CONTRACT_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outro",
};

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
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do interesse">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-gray-400">Candidato</p>
          <p className="mt-1 text-base font-semibold text-gray-900 break-words">
            {interest.candidateName}
          </p>
          <p className="mt-0.5 text-sm text-gray-500 break-words">
            {interest.candidateCity}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                interest.profileBadge === "COMPLETE"
                  ? "bg-success/10 text-success"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {interest.profileBadge === "COMPLETE" ? "Perfil completo" : "Perfil básico"}
            </span>

            {interest.candidateAvailability && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {AVAILABILITY_LABELS[interest.candidateAvailability]}
              </span>
            )}
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="text-sm text-gray-600 break-words">
              <span className="font-medium text-gray-700">WhatsApp:</span>{" "}
              {hasPhone ? interest.candidatePhone : "Disponível no plano Pro"}
            </p>

            {interest.candidateNeighborhood && (
              <p className="text-sm text-gray-600 break-words">
                <span className="font-medium text-gray-700">Bairro / Região:</span>{" "}
                {interest.candidateNeighborhood}
              </p>
            )}
          </div>

          {interest.candidateInterests && interest.candidateInterests.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400">Áreas de interesse</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {interest.candidateInterests.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    {CATEGORY_LABELS[item] ?? item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interest.candidateAcceptedContractTypes &&
            interest.candidateAcceptedContractTypes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400">Vínculos aceitos</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {interest.candidateAcceptedContractTypes.map((contractType) => (
                    <span
                      key={contractType}
                      className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600"
                    >
                      {CONTRACT_LABELS[contractType] ?? contractType}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {interest.candidateExperience && (
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-xs text-gray-400">Experiência resumida</p>
              <p className="mt-1 text-sm text-gray-700 break-words">
                {interest.candidateExperience}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400">Vaga</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{interest.jobTitle}</p>
            </div>

            <Link
              href={`/vaga/${interest.jobSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              onClick={onClose}
              className="shrink-0 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
            >
              Ver vaga
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-1">Interesse enviado em {formattedDate}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant="whatsapp"
            size="sm"
            onClick={handleWhatsApp}
            disabled={!hasPhone || isUpdating}
            title={!hasPhone ? "Disponível no plano Pro" : undefined}
            className="w-full"
          >
            <MessageCircle size={14} aria-hidden />
            Abrir WhatsApp
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} className="w-full">
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
    </Modal>
  );
};
