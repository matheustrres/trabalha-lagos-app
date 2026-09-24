"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, Eye, Clock, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";
import { Skeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

export default function PainelPage() {
  const { session } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["employer", "dashboard"],
    queryFn: employerService.getDashboard,
  });
  const firstName = session?.user.name.split(" ")[0] ?? "Empregador";
  const metrics = data
    ? [
        {
          label: "Vagas ativas",
          value: data.metrics.activeJobs,
          icon: Briefcase,
        },
        {
          label: "Novos interesses",
          value: data.metrics.newInterestsCount,
          icon: Users,
        },
        {
          label: "Interesses recebidos",
          value: data.metrics.interestsCount,
          icon: Users,
        },
        {
          label: "Vagas expiradas",
          value: data.metrics.expiredJobs,
          icon: Clock,
        },
        ...(data.permissions.totalViews
          ? [
              {
                label: "Visualizações",
                value: data.metrics.totalViews ?? 0,
                icon: Eye,
              },
            ]
          : []),
      ]
    : [];
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Painel do recrutador
          </p>
          <h1 className="font-sans text-2xl font-bold text-gray-900 sm:text-3xl">
            Olá, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe suas vagas e os próximos contatos.
          </p>
        </div>
        <Link
          href="/painel/nova-vaga"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={17} aria-hidden /> Publicar vaga
        </Link>
      </header>
      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error"
        >
          Não foi possível carregar o painel.{" "}
          <button className="font-semibold underline" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      )}
      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          : metrics.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm shadow-gray-900/[0.02]"
              >
                <Icon size={18} className="text-primary" aria-hidden />
                <p className="mt-4 text-2xl font-bold tabular-nums text-gray-900">
                  {value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              </div>
            ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-lg font-bold">Vagas recentes</h2>
            <Link
              href="/painel/vagas"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Ver todas <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : isError ? null : !data?.recentJobs.length ? (
            <div className="p-6 text-sm text-gray-500">
              Você ainda não publicou vagas.{" "}
              <Link
                href="/painel/nova-vaga"
                className="font-semibold text-primary underline"
              >
                Publique a primeira
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/painel/vagas/${job.id}/editar`}
                      className="font-semibold text-gray-900 hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">
                      {job.city} · {job.interestCount} interesses ·{" "}
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-gray-600">
                    {
                      {
                        ACTIVE: "Ativa",
                        PAUSED: "Pausada",
                        CLOSED: "Encerrada",
                        EXPIRED: "Expirada",
                      }[job.status]
                    }
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="min-w-0 rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-lg font-bold">
              Interesses recentes
            </h2>
            <Link
              href="/painel/interesses"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Ver todos <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : isError ? null : !data?.recentInterests.length ? (
            <div className="p-6 text-sm text-gray-500">
              Quando alguém demonstrar interesse, você verá os contatos aqui.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentInterests.map((interest) => (
                <li key={interest.id} className="px-5 py-4">
                  <p className="font-semibold text-gray-900">
                    {interest.candidateName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {interest.candidateCity} · {interest.jobTitle} ·{" "}
                    {formatDate(interest.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {data?.permissions.comparison && !!data.comparison?.length && (
        <section className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-sans text-lg font-bold">
            Desempenho por vaga
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Interesses ÷ visualizações acumuladas. Vagas sem visualizações não
            têm taxa.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead className="border-b border-border text-xs text-gray-500">
                <tr>
                  <th className="py-2 font-medium">Vaga</th>
                  <th className="py-2 text-right font-medium">Visualizações</th>
                  <th className="py-2 text-right font-medium">Interesses</th>
                  <th className="py-2 text-right font-medium">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {data.comparison.map((item) => (
                  <tr
                    key={item.jobId}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 font-medium">{item.title}</td>
                    <td className="py-3 text-right tabular-nums">
                      {item.viewCount}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {item.interestCount}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {item.interestViewRatio === null
                        ? "—"
                        : `${item.interestViewRatio}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
