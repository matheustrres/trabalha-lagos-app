"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";
import { JobForm } from "../../../nova-vaga/components/job-form";

export default function EditarVagaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    data: job,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["employer", "jobs", id],
    queryFn: () => employerService.getMyJob(id),
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat
      ) return;

      if (
        event.target instanceof Element &&
        event.target.closest('select, [role="dialog"], [role="listbox"], [role="combobox"]')
      ) return;

      event.preventDefault();
      router.push("/painel/vagas");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start gap-3">
        <Link
          href="/painel/vagas"
          aria-label="Voltar para minhas vagas"
          title="Voltar para minhas vagas (Esc)"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-bold text-gray-900">
            Editar vaga
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Atualize os dados da publicação.
          </p>
        </div>
      </div>
      {isLoading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-32" />
          <Skeleton className="h-10" />
        </div>
      )}
      {isError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-error/30 p-4 text-sm text-error"
        >
          Não foi possível carregar a vaga.{" "}
          <button className="font-semibold underline" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      )}
      {job && <JobForm job={job} />}
    </div>
  );
}
