"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { employerService } from "@/lib/services/employer.service";
import { JobForm } from "../../../nova-vaga/components/job-form";

export default function EditarVagaPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: job,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["employer", "jobs", id],
    queryFn: () => employerService.getMyJob(id),
  });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-2xl font-bold text-gray-900">
        Editar vaga
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Atualize os dados da publicação.
      </p>
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
