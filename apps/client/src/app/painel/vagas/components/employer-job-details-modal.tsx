"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";
import { formatSalaryRange } from "@/lib/utils/format-salary.utils";
import type { JobStatus } from "@/types/job.types";

const STATUS_LABEL: Record<JobStatus, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
  EXPIRED: "Expirada",
};

interface EmployerJobDetailsModalProps {
  jobId: string | null;
  onClose: () => void;
}

export const EmployerJobDetailsModal = ({ jobId, onClose }: EmployerJobDetailsModalProps) => {
  const [copied, setCopied] = useState(false);
  const { data: job, isPending, isError, refetch } = useQuery({
    queryKey: ["employer", "jobs", jobId],
    queryFn: () => employerService.getMyJob(jobId!),
    enabled: jobId !== null,
    retry: false,
  });

  const copyPublicLink = async () => {
    if (!job) return;
    const url = `${window.location.origin}/vaga/${job.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link público da vaga:", url);
    }
  };

  return (
    <Modal isOpen={jobId !== null} onClose={onClose} title="Detalhes da vaga">
      <div className="relative">
        <button type="button" onClick={onClose} aria-label="Fechar detalhes da vaga" className="absolute right-0 top-0 rounded-lg p-1 text-gray-600 hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary">
          <X size={20} aria-hidden />
        </button>
        <div className="space-y-5">
          {isPending && jobId && (
            <div role="status" aria-label="Carregando detalhes da vaga" className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-32" />
            </div>
          )}
          {isError && jobId && (
            <div role="alert" className="rounded-xl bg-error/10 p-4 pr-12 text-sm text-error">
              Não foi possível carregar os detalhes da vaga. {" "}
              <button type="button" onClick={() => refetch()} className="font-semibold underline focus-visible:outline-2 focus-visible:outline-primary">Tentar novamente</button>
            </div>
          )}
          {job && jobId === job.id && !isError && (
            <>
              <div className="pr-10">
                <h3 className="font-display text-xl font-bold text-gray-900">{job.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{job.city}</p>
                <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{STATUS_LABEL[job.status]}</span>
              </div>
              <dl className="grid gap-3 rounded-xl bg-surface p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Publicada em</dt><dd className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString("pt-BR")}</dd></div>
                <div><dt className="text-gray-500">Expira em</dt><dd className="font-medium text-gray-900">{new Date(job.expiresAt).toLocaleDateString("pt-BR")}</dd></div>
                <div><dt className="text-gray-500">Vínculo</dt><dd className="font-medium text-gray-900">{job.contractType}</dd></div>
                <div><dt className="text-gray-500">Salário</dt><dd className="font-medium text-gray-900">{job.salaryHidden ? "Não divulgado" : formatSalaryRange(job.salaryMin, job.salaryMax)}</dd></div>
                <div><dt className="text-gray-500">Categoria</dt><dd className="font-medium text-gray-900">{job.category.name}</dd></div>
                {job.address && <div><dt className="text-gray-500">Endereço</dt><dd className="font-medium text-gray-900">{job.address}</dd></div>}
              </dl>
              <section><h4 className="font-semibold text-gray-900">Descrição</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{job.description}</p></section>
              <section>
                <h4 className="font-semibold text-gray-900">Requisitos</h4>
                {job.requirements?.length ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {job.requirements.join("\n")}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">Nenhum requisito informado.</p>
                )}
              </section>
              <section><h4 className="font-semibold text-gray-900">Contato</h4><p className="mt-2 text-sm text-gray-700">{job.contactMethod === "EMAIL" ? job.contactEmail || "E-mail não informado" : job.whatsappContact || "WhatsApp não informado"}</p></section>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Link href={`/painel/vagas/${job.id}/editar`} onClick={onClose} className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Editar</Link>
                <Button variant="secondary" onClick={copyPublicLink}><Copy size={16} aria-hidden />{copied ? "Link copiado" : "Copiar link público"}</Button>
                <Button variant="ghost" onClick={onClose}>Fechar</Button>
              </div>
              {copied && <p role="status" className="flex items-center gap-1 text-sm text-success"><Check size={16} aria-hidden />Link público copiado.</p>}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
