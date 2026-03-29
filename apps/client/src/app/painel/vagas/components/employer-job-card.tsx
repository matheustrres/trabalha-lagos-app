"use client";

import { useState } from "react";
import { Pause, Play, X } from "lucide-react";
import type { EmployerJob } from "@/lib/mocks/employer-jobs.mock";
import type { JobStatus } from "@/types/job.types";
import { Button } from "@/components/ui/button";

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outro",
};

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Ativa", className: "bg-success/10 text-success" },
  PAUSED: { label: "Pausada", className: "bg-yellow-500/10 text-yellow-600" },
  CLOSED: { label: "Encerrada", className: "bg-gray-100 text-gray-500" },
  EXPIRED: { label: "Expirada", className: "bg-error/10 text-error" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

interface EmployerJobCardProps {
  job: EmployerJob;
  onStatusChange: (id: string, status: JobStatus) => void;
}

export const EmployerJobCard = ({
  job,
  onStatusChange,
}: EmployerJobCardProps) => {
  const [flashing, setFlashing] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status];

  const flash = (cb: () => void) => {
    setFlashing(true);
    cb();
    setTimeout(() => setFlashing(false), 300);
  };

  const handleClose = () => {
    if (window.confirm("Tem certeza que deseja encerrar esta vaga?")) {
      flash(() => onStatusChange(job.id, "CLOSED"));
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-border p-4 transition-opacity duration-150 ${flashing ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {job.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-400">
        {job.city} · {CONTRACT_TYPE_LABEL[job.contractType]} · Publicada em{" "}
        {formatDate(job.createdAt)}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {job.viewCount} visualizações · {job.interestCount} interesses
      </p>

      {(job.status === "ACTIVE" || job.status === "PAUSED") && (
        <div className="mt-3 flex justify-end gap-2">
          {job.status === "ACTIVE" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => flash(() => onStatusChange(job.id, "PAUSED"))}
              className="flex items-center gap-1 text-gray-500"
            >
              <Pause size={14} aria-hidden />
              Pausar
            </Button>
          )}
          {job.status === "PAUSED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => flash(() => onStatusChange(job.id, "ACTIVE"))}
              className="flex items-center gap-1 text-success"
            >
              <Play size={14} aria-hidden />
              Reativar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex items-center gap-1 text-error"
          >
            <X size={14} aria-hidden />
            Encerrar
          </Button>
        </div>
      )}
    </div>
  );
};
