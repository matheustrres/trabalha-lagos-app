"use client";

import { useState } from "react";
import { Pause, Play, X } from "lucide-react";
import type { EmployerJob, JobStatus } from "@/types/job.types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  onView: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  isUpdating?: boolean;
}

export const EmployerJobCard = ({
  job,
  onView,
  onStatusChange,
  isUpdating = false,
}: EmployerJobCardProps) => {
  const [flashing, setFlashing] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status];

  const flash = (cb: () => void) => {
    setFlashing(true);
    cb();
    setTimeout(() => setFlashing(false), 300);
  };

  const handleClose = () => {
    if (isUpdating) return;
    if (
      !window.confirm(
        `Encerrar a vaga “${job.title}”? Ela deixará de aparecer para candidatos.`,
      )
    )
      return;
    flash(() => onStatusChange(job.id, "CLOSED"));
  };

  return (
    <article
      className={`group relative rounded-2xl border border-border bg-white p-4 transition-[border-color,box-shadow,opacity] duration-150 hover:border-primary/40 hover:shadow-sm lg:flex lg:items-center lg:justify-between lg:gap-5 ${flashing ? "opacity-50" : "opacity-100"}`}
    >
      <button
        type="button"
        onClick={() => onView(job.id)}
        aria-label={`Visualizar vaga: ${job.title}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="min-w-0 font-semibold text-gray-900 leading-snug transition-colors group-hover:text-primary">
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
          {job.interestCount} interesses
          {job.viewCount !== undefined
            ? ` · ${job.viewCount} visualizações`
            : ""}
        </p>
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap justify-end gap-2 lg:mt-0">
        <Link
          href={`/painel/vagas/${job.id}/editar`}
          className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          Editar
        </Link>
        {(job.status === "ACTIVE" || job.status === "PAUSED") && (
          <>
            {job.status === "ACTIVE" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isUpdating}
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
                disabled={isUpdating}
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
              disabled={isUpdating}
              onClick={handleClose}
              className="flex items-center gap-1 text-error"
            >
              <X size={14} aria-hidden />
              Encerrar
            </Button>
          </>
        )}
      </div>
    </article>
  );
};
