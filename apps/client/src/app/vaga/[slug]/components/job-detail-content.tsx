import type { Job } from "@/types/job.types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceKm } from "@/lib/utils/format-distance.utils";
import { formatSalaryRange } from "@/lib/utils/format-salary.utils";
import { JobDetailHeader } from "./job-detail-header";

interface JobDetailContentProps {
  job: Job;
}

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  TEMPORARY: "Temporário",
  FREELANCER: "Freelancer",
  INTERNSHIP: "Estágio",
  OTHER: "Outro",
};

const CONTRACT_TYPE_COLOR: Record<string, string> = {
  CLT: "#0ea5e9",
  PJ: "#8b5cf6",
  TEMPORARY: "#ef4444",
  FREELANCER: "#f59e0b",
  INTERNSHIP: "#10b981",
  OTHER: "#6b7280",
};

function daysAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff === 0 ? "Hoje" : `${diff} dia${diff > 1 ? "s" : ""} atrás`;
}

export function JobDetailContent({ job }: JobDetailContentProps) {
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  return (
    <div
      data-job-detail
      className={job.status === "ACTIVE" ? "pb-[calc(4rem+env(safe-area-inset-bottom,8px))]" : undefined}
    >
      <JobDetailHeader jobSlug={job.slug} />

      <div className="px-4 py-5 space-y-5">
        {job.status !== "ACTIVE" && (
          <p role="status" className="rounded-xl bg-surface px-4 py-3 text-sm text-gray-600">
            Esta vaga não está recebendo candidaturas.
          </p>
        )}
        {/* Job header */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
            {job.category.icon}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-gray-900 leading-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm text-gray-500">{job.company.name}</span>
              {job.company.verified && (
                <span className="text-xs text-primary font-medium ml-1">
                  ✓ Verificada
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge
            label={CONTRACT_TYPE_LABEL[job.contractType] ?? job.contractType}
            color={CONTRACT_TYPE_COLOR[job.contractType] ?? "#6b7280"}
          />
          {job.urgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              🔥 Contratação Imediata
            </span>
          )}
          {job.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              ⭐ Em destaque
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-gray-400">📍 Localização</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {job.city}
              {job.distanceKm != null ? ` • ${formatDistanceKm(job.distanceKm)}` : ""}
            </p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-gray-400">💰 Salário</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {salary}
            </p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-gray-400">📅 Publicada</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {daysAgo(job.createdAt)}
            </p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-gray-400">📋 Categoria</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {job.category.name}
            </p>
          </div>
        </div>

        {/* About the job */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Sobre a vaga
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">
              Requisitos
            </h2>
            <ul className="space-y-1.5">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-success shrink-0 mt-0.5">✓</span>
                  <span className="text-sm text-gray-500">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* About the company */}
        <div className="border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
            🏢
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {job.company.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {job.city} • Região dos Lagos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
