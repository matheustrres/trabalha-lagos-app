"use client";

import Link from "next/link";
import { CheckCircle, ExternalLink, MapPin } from "lucide-react";
import { Badge, CONTRACT_BADGE } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistanceKm } from "@/lib/utils/format-distance.utils";
import { formatSalaryRange } from "@/lib/utils/format-salary.utils";
import type {
  ContractType,
  ExternalJob,
  InternalJob,
  SearchJob,
} from "@/types/job.types";

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outros",
};

interface JobCardProps {
  job: SearchJob;
}

export const JobCard = ({ job }: JobCardProps) => {
  if (job.sourceType === "EXTERNAL") {
    return <ExternalJobCard job={job} />;
  }

  return <InternalJobCard job={job} />;
};

const InternalJobCard = ({ job }: { job: InternalJob }) => {
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
            {job.distanceKm != null && ` • ${formatDistanceKm(job.distanceKm)}`}
          </span>
          <span className="text-sm font-semibold text-primary">
            {formatSalaryRange(job.salaryMin, job.salaryMax)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const ExternalJobCard = ({ job }: { job: ExternalJob }) => {
  const isSynthetic = job.externalSource === "SYNTHETIC";
  const card = (
    <div className="rounded-2xl border border-primary/30 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ExternalLink className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{job.title}</p>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
              {isSynthetic ? "Teste externo" : "Externa"}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-600">
            {job.companyName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {job.contractType && (
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-gray-700">
                {job.contractType}
              </span>
            )}
            {job.categoryName && (
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-gray-600">
                {job.categoryName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1 text-xs text-gray-600">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{job.locationText}</span>
          {job.distanceKm != null && (
            <span className="shrink-0">· {formatDistanceKm(job.distanceKm)}</span>
          )}
        </span>
        <span className="shrink-0 text-sm font-semibold text-primary">
          {formatSalaryRange(job.salaryMin ?? undefined, job.salaryMax ?? undefined)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-600">
        {job.description}
      </p>

      <p className="mt-3 text-xs font-semibold text-primary-dark">
        {isSynthetic ? "Vaga fictícia para validação local" : "Ver vaga no site de origem →"}
      </p>
    </div>
  );

  if (isSynthetic || !job.redirectUrl) return card;

  return (
    <a
      href={job.redirectUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={`Abrir vaga externa: ${job.title}`}
    >
      {card}
    </a>
  );
};
