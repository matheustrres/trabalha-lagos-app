"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
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
];

const STATUS_ORDER: JobStatus[] = ["ACTIVE", "PAUSED", "CLOSED", "EXPIRED"];

const MinhasVagasPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employer", "jobs"],
    queryFn: employerService.getMyJobs,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      employerService.updateJobStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
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
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900">
          Minhas vagas
        </h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/painel/nova-vaga")}
        >
          Nova vaga
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="mx-auto flex w-max gap-2">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-primary text-white"
                  : "bg-surface text-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col space-y-3">
        {isLoading ? (
          <JobListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-12 text-center">
            <SearchX size={40} className="text-gray-300" aria-hidden />
            <p className="font-semibold text-gray-500">
              Nenhuma vaga encontrada
            </p>
            <p className="text-sm text-gray-400">
              Publique sua primeira vaga para começar
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => router.push("/painel/nova-vaga")}
            >
              Publicar vaga
            </Button>
          </div>
        ) : (
          filtered.map((job) => (
            <EmployerJobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
              isUpdating={
                statusMutation.isPending && statusMutation.variables?.id === job.id
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MinhasVagasPage;
