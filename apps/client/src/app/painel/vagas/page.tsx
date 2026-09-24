"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobListSkeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";
import type { JobStatus } from "@/types/job.types";
import { EmployerJobCard } from "./components/employer-job-card";

type FilterStatus = "ALL" | JobStatus;

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Ativas", value: "ACTIVE" },
  { label: "Pausadas", value: "PAUSED" },
  { label: "Encerradas", value: "CLOSED" },
  { label: "Expiradas", value: "EXPIRED" },
];

const STATUS_ORDER: JobStatus[] = ["ACTIVE", "PAUSED", "CLOSED", "EXPIRED"];

const MinhasVagasPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["employer", "jobs"],
    queryFn: employerService.getMyJobs,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      employerService.updateJobStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      await queryClient.invalidateQueries({
        queryKey: ["employer", "dashboard"],
      });
    },
  });

  const jobs = data ?? [];
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const handleStatusChange = (id: string, status: JobStatus) => {
    statusMutation.mutate({ id, status });
  };

  const filtered = jobs
    .filter((job) => filter === "ALL" || job.status === filter)
    .sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between gap-4">
        <h1 className="-translate-y-0.5 font-sans text-2xl font-bold text-gray-900">
          Minhas vagas
        </h1>
        {(isLoading || isError || jobs.length > 0) && (
          <Button
            variant="primary"
            size="sm"
            className="translate-y-1"
            onClick={() => router.push("/painel/nova-vaga")}
          >
            Nova vaga
          </Button>
        )}
      </div>

      {!isLoading && !isError && jobs.length > 0 && (
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex w-max gap-2">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  filter === value
                    ? "bg-primary text-white"
                    : "bg-surface text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {statusMutation.isError && (
          <div
            role="alert"
            className="rounded-xl border border-error/30 p-4 text-sm text-error"
          >
            Não foi possível alterar o status da vaga. Tente novamente.
          </div>
        )}
        {isError ? (
          <div
            role="alert"
            className="rounded-xl border border-error/30 p-4 text-sm text-error"
          >
            Não foi possível carregar suas vagas.{" "}
            <button
              className="font-semibold underline"
              onClick={() => refetch()}
            >
              Tentar novamente
            </button>
          </div>
        ) : isLoading ? (
          <JobListSkeleton count={3} />
        ) : jobs.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-surface/50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase size={22} aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Sua lista de vagas começa aqui
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
              Publique a primeira vaga para acompanhar o status, as
              visualizações e os interesses recebidos neste espaço.
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-6"
              onClick={() => router.push("/painel/nova-vaga")}
            >
              Publicar primeira vaga
            </Button>
          </section>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border px-6 py-12 text-center">
            <SearchX size={32} className="mx-auto text-gray-400" aria-hidden />
            <p className="mt-4 font-semibold text-gray-900">
              Nenhuma vaga neste status
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setFilter("ALL")}
            >
              Ver todas as vagas
            </button>
          </div>
        ) : (
          filtered.map((job) => (
            <EmployerJobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
              isUpdating={
                statusMutation.isPending &&
                statusMutation.variables?.id === job.id
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MinhasVagasPage;
