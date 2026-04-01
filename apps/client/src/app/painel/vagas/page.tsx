"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobListSkeleton } from "@/components/ui/skeleton";
import { jobsService } from "@/lib/services/jobs.service";
import type { EmployerJob, JobStatus } from "@/types/job.types";
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
  const { data, isLoading } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: jobsService.findByCompany,
  });
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    setJobs(data ?? []);
  }, [data]);

  const handleStatusChange = (id: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status } : job)),
    );
  };

  const filtered = jobs
    .filter((job) => filter === "ALL" || job.status === filter)
    .sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between">
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

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <JobListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MinhasVagasPage;
