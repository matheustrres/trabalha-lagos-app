"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { interestsService } from "@/lib/services/interests.service";
import {
  createInterestSchema,
  type CreateInterestData,
} from "../schemas/create-interest.schema";

interface InterestFormProps {
  jobId: string;
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InterestForm({
  jobId,
  companyName,
  onSuccess,
  onCancel,
}: InterestFormProps) {
  const [candidateProfile, setCandidateProfile] = useState<{
    name: string;
    phone: string;
    city?: string | null;
  } | null>(null);
  const isAuthenticatedCandidate = candidateProfile !== null;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInterestData>({
    resolver: zodResolver(createInterestSchema),
    defaultValues: {
      name: "",
      phone: "",
      city: "São Pedro da Aldeia",
    },
  });

  useEffect(() => {
    const session = getSession();

    if (session?.user.role === "CANDIDATE") {
      setCandidateProfile({
        name: session.user.name,
        phone: session.user.phone,
        city: session.user.city,
      });
      return;
    }

    setCandidateProfile(null);
  }, []);

  useEffect(() => {
    if (!candidateProfile) return;

    reset({
      name: candidateProfile.name,
      phone: candidateProfile.phone,
      city: candidateProfile.city ?? "São Pedro da Aldeia",
    });
  }, [candidateProfile, reset]);

  const onSubmit = async (data: CreateInterestData) => {
    setServerError(null);

    try {
      const payload = isAuthenticatedCandidate
        ? {
            name: candidateProfile.name,
            phone: candidateProfile.phone,
            city: candidateProfile.city ?? data.city,
          }
        : data;

      await interestsService.create(jobId, payload);
      onSuccess();
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number(error.status)
          : undefined;

      if (status === 409) {
        setServerError("Você já demonstrou interesse nesta vaga");
        return;
      }

      if (status === 404) {
        setServerError("Esta vaga não está mais disponível");
        return;
      }

      if (status === 429) {
        setServerError(
          "Muitas requisições. Aguarde alguns segundos e tente novamente.",
        );
        return;
      }

      setServerError("Erro ao enviar interesse. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 mt-3"
    >
      <p className="text-sm text-gray-500">
        Seus dados serão enviados para <strong>{companyName}</strong>
      </p>

      {isAuthenticatedCandidate && (
        <div className="bg-surface rounded-xl px-4 py-3 text-sm text-gray-600">
          Seus dados do perfil serão usados para enviar seu interesse.
        </div>
      )}

      {serverError && (
        <div className="bg-error/10 text-error rounded-xl px-4 py-2 text-sm">
          {serverError}
        </div>
      )}

      {!isAuthenticatedCandidate && (
        <>
          <Input
            id="name"
            label="Nome completo"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            id="phone"
            label="WhatsApp"
            placeholder="(22) 99999-9999"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">
              Cidade
            </label>
            <select
              id="city"
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              {...register("city")}
            >
              {LAGOS_CITIES.map((city) => (
                <option key={city.slug} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city && (
              <p role="alert" className="text-sm text-error">
                {errors.city.message}
              </p>
            )}
          </div>
        </>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Enviar interesse"}
      </Button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-sm text-gray-400"
      >
        Cancelar
      </button>
    </form>
  );
}
