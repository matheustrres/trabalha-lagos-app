"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import {
  createInterestSchema,
  type CreateInterestData,
} from "../schemas/create-interest.schema";

interface InterestFormProps {
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InterestForm({
  companyName,
  onSuccess,
  onCancel,
}: InterestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInterestData>({
    resolver: zodResolver(createInterestSchema),
    defaultValues: { city: "São Pedro da Aldeia" },
  });

  const onSubmit = async (/* data: CreateInterestData */) => {
    setServerError(null);
    try {
      // TODO: replace with real API call when backend is ready
      // await api.post(`/jobs/${jobId}/interest`, data)
      await new Promise((r) => setTimeout(r, 1000));
      onSuccess();
    } catch {
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

      {serverError && (
        <div className="bg-error/10 text-error rounded-xl px-4 py-2 text-sm">
          {serverError}
        </div>
      )}

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
