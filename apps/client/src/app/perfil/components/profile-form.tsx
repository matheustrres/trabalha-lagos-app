"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants/categories.constants";
import { usersService } from "@/lib/services/users.service";
import {
  AVAILABILITY_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  type UpdateProfileData,
  updateProfileSchema,
} from "../schemas/update-profile.schema";

const AVAILABILITY_LABELS: Record<(typeof AVAILABILITY_OPTIONS)[number], string> = {
  IMMEDIATE: "Imediata",
  IN_15_DAYS: "Em 15 dias",
  IN_30_DAYS: "Em 30 dias",
  NEGOTIABLE: "A combinar",
};

const CONTRACT_LABELS: Record<(typeof CONTRACT_TYPE_OPTIONS)[number], string> = {
  CLT: "CLT",
  PJ: "PJ",
  FREELANCER: "Freelancer",
  TEMPORARY: "Temporário",
  INTERNSHIP: "Estágio",
  OTHER: "Outro",
};

export const ProfileForm = () => {
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["candidate", "profile"],
    queryFn: usersService.getMyProfile,
  });

  const defaultValues = useMemo<UpdateProfileData>(
    () => ({
      interests: profile?.interests ?? [],
      experience: profile?.experience ?? "",
      availability: profile?.availability ?? null,
      acceptedContractTypes: (profile?.acceptedContractTypes ?? []).filter(
        (item): item is (typeof CONTRACT_TYPE_OPTIONS)[number] =>
          CONTRACT_TYPE_OPTIONS.includes(item as (typeof CONTRACT_TYPE_OPTIONS)[number]),
      ),
      neighborhood: profile?.neighborhood ?? "",
    }),
    [profile],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const interests = watch("interests");
  const acceptedContractTypes = watch("acceptedContractTypes");

  const mutation = useMutation({
    mutationFn: usersService.updateMyProfile,
  });

  const toggleInterests = (value: string) => {
    const current = watch("interests");
    const hasValue = current.includes(value);
    const next = hasValue
      ? current.filter((item) => item !== value)
      : [...current, value];

    setValue("interests", next, { shouldDirty: true, shouldValidate: true });
  };

  const toggleContractType = (value: (typeof CONTRACT_TYPE_OPTIONS)[number]) => {
    const current = watch("acceptedContractTypes");
    const hasValue = current.includes(value);
    const next = hasValue
      ? current.filter((item) => item !== value)
      : [...current, value];

    setValue("acceptedContractTypes", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: UpdateProfileData) => {
    setNotification(null);

    try {
      const normalizedData: UpdateProfileData = {
        ...data,
        experience: data.experience.trim(),
        neighborhood: data.neighborhood.trim(),
      };

      await mutation.mutateAsync({
        interests: normalizedData.interests,
        experience: normalizedData.experience || undefined,
        availability: normalizedData.availability ?? undefined,
        acceptedContractTypes: normalizedData.acceptedContractTypes,
        neighborhood: normalizedData.neighborhood || undefined,
      });

      reset(normalizedData);
      setNotification({
        type: "success",
        message: "Perfil atualizado com sucesso.",
      });
    } catch {
      setNotification({
        type: "error",
        message: "Não foi possível atualizar o perfil. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  if (isLoading) {
    return <p className="px-4 py-6 text-sm text-gray-500">Carregando perfil...</p>;
  }

  if (isError || !profile) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-error">Erro ao carregar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {notification && (
        <div className="fixed inset-x-4 top-16 z-50 mx-auto w-auto max-w-md">
          <div
            role={notification.type === "error" ? "alert" : "status"}
            className={`rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              notification.type === "success"
                ? "bg-primary"
                : "bg-error"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p>{notification.message}</p>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-xs font-semibold text-white/80 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-display text-xl font-bold text-gray-900">Meu perfil</h1>
      <p className="text-sm text-gray-500 mt-1">
        Complete seu perfil para se destacar para os empregadores.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">Áreas de interesse</p>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.slug}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={interests.includes(category.slug)}
                  onChange={() => toggleInterests(category.slug)}
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  {category.icon} {category.name}
                </span>
              </label>
            ))}
          </div>
          {errors.interests?.message && (
            <p className="text-sm text-error mt-1">{errors.interests.message}</p>
          )}
        </section>

        <section>
          <label htmlFor="experience" className="text-sm font-medium text-gray-700">
            Experiência resumida
          </label>
          <textarea
            id="experience"
            rows={3}
            maxLength={200}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 resize-none"
            placeholder="Ex: 3 anos como garçom em Búzios e Cabo Frio"
            {...register("experience")}
          />
          <p className="text-xs text-gray-400 mt-1">Máximo de 200 caracteres.</p>
          {errors.experience?.message && (
            <p className="text-sm text-error mt-1">{errors.experience.message}</p>
          )}
        </section>

        <section>
          <label htmlFor="availability" className="text-sm font-medium text-gray-700">
            Disponibilidade
          </label>
          <select
            id="availability"
            className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            value={watch("availability") ?? ""}
            onChange={(event) =>
              setValue(
                "availability",
                event.target.value
                  ? (event.target.value as UpdateProfileData["availability"])
                  : null,
                { shouldDirty: true },
              )
            }
          >
            <option value="">Selecione</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {AVAILABILITY_LABELS[option]}
              </option>
            ))}
          </select>
          {errors.availability?.message && (
            <p className="text-sm text-error mt-1">{errors.availability.message}</p>
          )}
        </section>

        <section>
          <p className="text-sm font-medium text-gray-700 mb-2">Tipos de vínculo aceitos</p>
          <div className="grid grid-cols-2 gap-2">
            {CONTRACT_TYPE_OPTIONS.map((contractType) => (
              <label
                key={contractType}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={acceptedContractTypes.includes(contractType)}
                  onChange={() => toggleContractType(contractType)}
                  className="h-4 w-4 accent-primary"
                />
                <span>{CONTRACT_LABELS[contractType]}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <Input
            id="neighborhood"
            label="Bairro / Região"
            placeholder="Ex: Centro de São Pedro da Aldeia"
            maxLength={100}
            error={errors.neighborhood?.message}
            {...register("neighborhood")}
          />
        </section>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? "Salvando..." : "Salvar perfil"}
        </Button>
      </form>
    </div>
  );
};
