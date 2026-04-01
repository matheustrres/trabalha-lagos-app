"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { MOCK_INTERESTS } from "@/lib/mocks/interests.mock";
import { jobsService } from "@/lib/services/jobs.service";
import type { Interest } from "@/types/interest.types";
import { InterestCard } from "./components/interest-card";

type FilterStatus = "ALL" | "SENT" | "VIEWED" | "CONTACTED";

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Novos", value: "SENT" },
  { label: "Visualizados", value: "VIEWED" },
  { label: "Contatados", value: "CONTACTED" },
];

const InteressesPage = () => {
  const { data: companyJobs } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: jobsService.findByCompany,
  });
  const [interests, setInterests] = useState<Interest[]>(MOCK_INTERESTS);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [jobFilter, setJobFilter] = useState<string>("ALL");

  const handleStatusChange = (id: string, status: Interest["status"]) => {
    setInterests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const filtered = interests
    .filter((i) => statusFilter === "ALL" || i.status === statusFilter)
    .filter((i) => jobFilter === "ALL" || i.jobId === jobFilter)
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
          {interests.length} candidatos interessados
        </p>
      </div>

      <div className="mt-4 bg-blue-500/10 text-blue-600 text-sm rounded-xl px-4 py-3">
        No plano gratuito, você vê nome e cidade.{" "}
        <span className="font-semibold">Faça upgrade</span> para ver o WhatsApp
        completo.
      </div>

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
        {filtered.length === 0 ? (
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
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InteressesPage;
