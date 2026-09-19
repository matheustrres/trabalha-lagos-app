"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, Eye, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-blue-500/10", text: "text-blue-500" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  gray: { bg: "bg-gray-500/10", text: "text-gray-500" },
};

const PainelPage = () => {
  const { session } = useAuth();
  const router = useRouter();
  const firstName = session?.user.name.split(" ")[0] ?? "Empregador";

  const { data, isLoading } = useQuery({
    queryKey: ["employer", "dashboard"],
    queryFn: async () => {
      const [jobs, interests] = await Promise.all([
        employerService.getMyJobs(),
        employerService.getInterests(),
      ]);

      const activeJobs = jobs.filter((job) => job.status === "ACTIVE").length;
      const now = Date.now();
      const expiredJobs = jobs.filter((job) => {
        const expiresAt = new Date(job.expiresAt).getTime();
        return Number.isFinite(expiresAt) && expiresAt <= now;
      }).length;
      const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount ?? 0), 0);

      return {
        activeJobs,
        interestsCount: interests.meta.total,
        totalViews,
        expiredJobs,
      };
    },
  });

  const metrics = [
    {
      label: "Vagas ativas",
      value: data?.activeJobs ?? 0,
      icon: Briefcase,
      color: "primary",
    },
    {
      label: "Interesses recebidos",
      value: data?.interestsCount ?? 0,
      icon: Users,
      color: "info",
    },
    {
      label: "Visualizações",
      value: data?.totalViews ?? 0,
      icon: Eye,
      color: "warning",
    },
    {
      label: "Vagas expiradas",
      value: data?.expiredJobs ?? 0,
      icon: Clock,
      color: "gray",
    },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">
          Olá, {firstName}!
        </h1>
        <p className="text-sm text-gray-500">
          Gerencie suas vagas e veja quem se interessou.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {metrics.map(({ label, value, icon: Icon, color }) => {
          const { bg, text } = COLOR_MAP[color];
          return (
            <div
              key={label}
              className="bg-white rounded-2xl border border-border p-4"
            >
              <span className={`inline-flex rounded-xl p-2 ${bg}`}>
                <Icon size={16} className={text} aria-hidden />
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-14 mt-3" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push("/painel/nova-vaga")}
        >
          Publicar nova vaga
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/painel/interesses")}
        >
          Ver interesses
        </Button>
      </div>
    </div>
  );
};

export default PainelPage;
