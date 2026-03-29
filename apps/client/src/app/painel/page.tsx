"use client";

import { useRouter } from "next/navigation";
import { Briefcase, Users, Eye, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";
import { Button } from "@/components/ui/button";

const METRICS = [
  { label: "Vagas ativas", value: 3, icon: Briefcase, color: "primary" },
  { label: "Interesses recebidos", value: 12, icon: Users, color: "info" },
  { label: "Visualizações", value: 89, icon: Eye, color: "warning" },
  { label: "Vagas expiradas", value: 1, icon: Clock, color: "gray" },
] as const;

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info: { bg: "bg-blue-500/10", text: "text-blue-500" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  gray: { bg: "bg-gray-500/10", text: "text-gray-500" },
};

const PainelPage = () => {
  const { session } = useAuth();
  const router = useRouter();
  const firstName = session?.name.split(" ")[0] ?? "Empregador";

  return (
    <div className="max-w-lg mx-auto">
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">
          Olá, {firstName}!
        </h1>
        <p className="text-sm text-gray-500">
          Gerencie suas vagas e veja quem se interessou.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {METRICS.map(({ label, value, icon: Icon, color }) => {
          const { bg, text } = COLOR_MAP[color];
          return (
            <div
              key={label}
              className="bg-white rounded-2xl border border-border p-4"
            >
              <span className={`inline-flex rounded-xl p-2 ${bg}`}>
                <Icon size={16} className={text} aria-hidden />
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3">
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
