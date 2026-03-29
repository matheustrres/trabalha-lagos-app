"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Badge, CONTRACT_BADGE } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn.utils";
import { formatSalaryRange } from "@/lib/utils/format-salary.utils";
import type { Job, ContractType } from "@/types/job.types";

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outros",
};

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const contractLabel = CONTRACT_TYPE_LABELS[job.contractType];
  const badge = CONTRACT_BADGE[contractLabel] ?? CONTRACT_BADGE["CLT"];

  return (
    <Link href={`/vaga/${job.slug}`} className="block">
      <div
        className={cn(
          "relative rounded-2xl bg-white p-4 transition-all duration-150 active:scale-[0.98]",
          job.featured
            ? "border-2 border-primary shadow-md shadow-primary/10 hover:shadow-lg"
            : "border border-border shadow-sm hover:shadow-md",
        )}
      >
        {job.featured && (
          <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            ⭐ Destaque
          </span>
        )}

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
            {job.category.icon ?? "📋"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {job.title}
            </p>

            <div className="mt-0.5 flex items-center gap-1">
              <span className="truncate text-xs text-gray-500">
                {job.company.name}
              </span>
              {job.company.verified && (
                <CheckCircle
                  size={12}
                  className="shrink-0 text-green-500"
                  aria-label="Empresa verificada"
                />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge label={badge.label} color={badge.color} />
              {job.urgent && (
                <span className="bg-error/10 text-error text-xs font-semibold px-2 py-0.5 rounded-md">
                  🔥 Urgente
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            📍 {job.city}
            {job.distanceKm != null && ` • ${job.distanceKm} km`}
          </span>
          <span className="text-sm font-semibold text-primary">
            {formatSalaryRange(job.salaryMin, job.salaryMax)}
          </span>
        </div>
      </div>
    </Link>
  );
};
