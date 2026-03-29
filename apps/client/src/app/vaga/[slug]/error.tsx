"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VagaError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <AlertTriangle size={48} className="text-error" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Erro ao carregar vaga
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Não foi possível carregar os detalhes desta vaga.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 font-mono text-xs text-gray-400">
            {error.message}
          </p>
        )}
        <Button className="mt-6 w-full max-w-xs" onClick={reset}>
          Tentar novamente
        </Button>
        <Link href="/vagas" className="mt-3 text-sm text-primary">
          Ver todas as vagas
        </Link>
      </div>
    </div>
  );
}
