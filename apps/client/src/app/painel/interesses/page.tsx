"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { employerService } from "@/lib/services/employer.service";
import type { Interest } from "@/types/interest.types";
import { InterestCard } from "./components/interest-card";
import { InterestDetailsSheet } from "./components/interest-details-sheet";

type FilterStatus = "ALL" | Interest["status"];

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Novos", value: "SENT" },
  { label: "Descartados", value: "REJECTED" },
];

const InteressesPage = () => {
  const queryClient = useQueryClient();

  const { data: companyJobs } = useQuery({
    queryKey: ["employer", "jobs"],
    queryFn: employerService.getMyJobs,
  });

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [jobFilter, setJobFilter] = useState<string>("ALL");
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

  const filters = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(jobFilter !== "ALL" && { jobId: jobFilter }),
  };

  const { data: interestsResponse, isLoading } = useQuery({
    queryKey: ["employer", "interests", filters],
    queryFn: () => employerService.getInterests(filters),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Interest["status"] }) =>
      employerService.updateInterestStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employer", "interests"] });
      await queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });

  const interests = interestsResponse?.data ?? [];
  const phoneRestricted = interestsResponse?.meta.phoneRestricted ?? false;

  const handleStatusChange = (id: string, status: Interest["status"]) => {
    statusMutation.mutate({ id, status });
  };

  const filtered = interests
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="max-w-lg mx-auto">
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">
          Interesses recebidos
        </h1>
        <p className="text-sm text-gray-500">
          {interestsResponse?.meta.total ?? 0} candidatos interessados
        </p>
      </div>

      {phoneRestricted && (
        <div className="mt-4 bg-blue-500/10 text-blue-600 text-sm rounded-xl px-4 py-3">
          No plano gratuito, você vê nome e cidade.{" "}
          <span className="font-semibold">Faça upgrade</span> para ver o WhatsApp
          completo.
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value
                ? "bg-primary text-white"
                : "bg-surface text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="ALL">Todas as vagas</option>
          {(companyJobs ?? []).map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando interesses...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <SearchX size={40} className="text-gray-300" aria-hidden />
            <p className="font-semibold text-gray-500">
              Nenhum interesse recebido
            </p>
            <p className="text-sm text-gray-400">
              Quando candidatos demonstrarem interesse nas suas vagas, eles
              aparecerão aqui.
            </p>
          </div>
        ) : (
          filtered.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              onOpenDetails={setSelectedInterest}
              onStatusChange={handleStatusChange}
              isUpdating={
                statusMutation.isPending &&
                statusMutation.variables?.id === interest.id
              }
            />
          ))
        )}
      </div>

      <InterestDetailsSheet
        interest={selectedInterest}
        isOpen={selectedInterest !== null}
        onClose={() => setSelectedInterest(null)}
        onStatusChange={handleStatusChange}
        isUpdating={
          statusMutation.isPending &&
          statusMutation.variables?.id === selectedInterest?.id
        }
      />
    </div>
  );
};

export default InteressesPage;
