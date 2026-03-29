"use client";

import { useState, useMemo } from "react";
import { Search, SearchX } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { useDebounce } from "@/hooks/use-debounce.hook";
import { RADIUS_OPTIONS } from "@/lib/constants/radius.constants";
import { cn } from "@/lib/utils/cn.utils";
import type { Job } from "@/types/job.types";

interface JobSearchProps {
  initialJobs: Job[];
}

export const JobSearch = ({ initialJobs }: JobSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(20);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredJobs = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();

    return initialJobs
      .filter((job) => {
        if (
          query &&
          !job.title.toLowerCase().includes(query) &&
          !job.company.name.toLowerCase().includes(query)
        ) {
          return false;
        }
        if (radius < 100 && job.distanceKm != null && job.distanceKm > radius) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const da = a.distanceKm ?? Infinity;
        const db = b.distanceKm ?? Infinity;
        return da - db;
      });
  }, [initialJobs, debouncedQuery, radius]);

  return (
    <div className="px-4 py-6">
      <div
        className="rounded-xl px-3 py-3 flex items-center gap-2"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #9ca3af",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Search className="text-gray-400 size-4 shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar vagas, empresas..."
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-gray-400 shrink-0">📍 Raio:</span>
        <div className="flex gap-1.5 overflow-x-auto">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRadius(option.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                radius === option.value
                  ? "bg-primary text-white"
                  : "bg-surface text-gray-500",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {filteredJobs.length} vagas encontradas
        </span>
        <span className="text-sm text-gray-500">Ordenado por distância</span>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="mt-3 space-y-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <SearchX className="size-10 text-gray-300" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-600">
            Nenhuma vaga encontrada
          </p>
          <p className="text-xs text-gray-400">
            Tente ampliar o raio ou mudar a busca
          </p>
        </div>
      )}
    </div>
  );
};
