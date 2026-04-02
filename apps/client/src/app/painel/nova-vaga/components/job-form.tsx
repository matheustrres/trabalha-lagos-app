"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, MapPin, DollarSign, Phone, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants/categories.constants";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { employerService } from "@/lib/services/employer.service";
import {
  createJobSchema,
  type CreateJobData,
} from "../schemas/create-job.schema";

const CONTRACT_TYPES = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "TEMPORARY", label: "Temporário" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "OTHER", label: "Outro" },
] as const;

const CONTACT_METHODS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PLATFORM", label: "Pela plataforma" },
  { value: "BOTH", label: "Ambos" },
] as const;

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const selectClass =
  "h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1";

const selectErrorClass =
  "h-10 w-full rounded-xl border border-error bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-1";

const textareaClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 resize-none";

const textareaErrorClass =
  "w-full rounded-xl border border-error bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-1 resize-none";

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
}

const SectionHeading = ({ icon, title }: SectionHeadingProps) => (
  <div className="text-sm font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
    {icon}
    {title}
  </div>
);

export const JobForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      salaryHidden: false,
      contactMethod: "WHATSAPP",
    },
  });

  const salaryHidden = watch("salaryHidden");

  const resolveErrorStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== "object") return undefined;

    const candidate = error as { status?: number; statusCode?: number };
    return candidate.status ?? candidate.statusCode;
  };

  const onSubmit = async (data: CreateJobData) => {
    setSubmitError(null);

    const selectedCity = LAGOS_CITIES.find((cityOption) => cityOption.slug === data.city);
    const categoryIndex = CATEGORIES.findIndex(
      (categoryOption) => categoryOption.slug === data.categoryId,
    );

    if (!selectedCity || categoryIndex < 0) {
      setSubmitError("Não foi possível validar os dados da vaga.");
      return;
    }

    const requirements = data.requirements
      ?.split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await employerService.createJob({
        ...data,
        categoryId: categoryIndex + 1,
        city: selectedCity.name,
        locationLat: selectedCity.lat,
        locationLng: selectedCity.lng,
        whatsappContact: data.whatsappContact.replace(/\D/g, ""),
        requirements: requirements?.length ? requirements : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
      router.push("/painel/vagas");
    } catch (error) {
      const status = resolveErrorStatus(error);

      if (status === 403) {
        setSubmitError(
          "Limite de vagas atingido. Faça upgrade para publicar mais.",
        );
        return;
      }

      if (status === 400) {
        setSubmitError("Localização fora da Região dos Lagos");
        return;
      }

      setSubmitError("Não foi possível publicar a vaga. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && (
        <div className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium mb-4">
          {submitError}
        </div>
      )}

      {/* Seção 1: Informações básicas */}
      <SectionHeading
        icon={<Briefcase size={15} aria-hidden />}
        title="Informações básicas"
      />

      <div className="flex flex-col gap-4">
        <Input
          id="title"
          label="Título da vaga *"
          placeholder="Ex: Garçom, Vendedora, Pedreiro"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Descrição *
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder={
              "Descreva as atividades da vaga, horário de trabalho, benefícios...\nEx: Buscamos garçom para restaurante na orla de Cabo Frio, com experiência em atendimento ao cliente."
            }
            className={errors.description ? textareaErrorClass : textareaClass}
            style={{ minHeight: "120px" }}
            {...register("description")}
          />
          {errors.description && (
            <p role="alert" className="text-sm text-error">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-gray-700"
          >
            Categoria *
          </label>
          <select
            id="categoryId"
            className={errors.categoryId ? selectErrorClass : selectClass}
            {...register("categoryId")}
          >
            <option value="">Selecione uma categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p role="alert" className="text-sm text-error">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="contractType"
            className="text-sm font-medium text-gray-700"
          >
            Tipo de contrato *
          </label>
          <select
            id="contractType"
            className={errors.contractType ? selectErrorClass : selectClass}
            {...register("contractType")}
          >
            <option value="">Selecione o tipo de contrato</option>
            {CONTRACT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.contractType && (
            <p role="alert" className="text-sm text-error">
              {errors.contractType.message}
            </p>
          )}
        </div>
      </div>

      {/* Seção 2: Localização */}
      <SectionHeading
        icon={<MapPin size={15} aria-hidden />}
        title="Localização"
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-sm font-medium text-gray-700">
            Cidade *
          </label>
          <select
            id="city"
            className={errors.city ? selectErrorClass : selectClass}
            {...register("city")}
          >
            <option value="">Selecione uma cidade</option>
            {LAGOS_CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
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

        <Input
          id="address"
          label="Endereço (opcional)"
          placeholder="Rua, número, bairro"
          error={errors.address?.message}
          {...register("address")}
        />
      </div>

      {/* Seção 3: Remuneração */}
      <SectionHeading
        icon={<DollarSign size={15} aria-hidden />}
        title="Remuneração"
      />

      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            {...register("salaryHidden")}
          />
          <span className="text-sm text-gray-700">Não informar salário</span>
        </label>

        {!salaryHidden && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="salaryMin"
              type="number"
              label="Salário mínimo"
              placeholder="Ex: 1800"
              error={errors.salaryMin?.message}
              {...register("salaryMin", {
                setValueAs: (v: string) => v === "" ? undefined : Number(v),
              })}
            />
            <Input
              id="salaryMax"
              type="number"
              label="Salário máximo"
              placeholder="Ex: 2500"
              error={errors.salaryMax?.message}
              {...register("salaryMax", {
                setValueAs: (v: string) => v === "" ? undefined : Number(v),
              })}
            />
          </div>
        )}
      </div>

      {/* Seção 4: Contato */}
      <SectionHeading icon={<Phone size={15} aria-hidden />} title="Contato" />

      <div className="flex flex-col gap-4">
        <Input
          id="whatsappContact"
          label="WhatsApp para contato *"
          placeholder="(22) 99999-9999"
          inputMode="numeric"
          error={errors.whatsappContact?.message}
          {...register("whatsappContact", {
            onChange: (e) => {
              setValue("whatsappContact", formatPhone(e.target.value), {
                shouldValidate: false,
              });
            },
          })}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="contactMethod"
            className="text-sm font-medium text-gray-700"
          >
            Método de contato
          </label>
          <select
            id="contactMethod"
            className={selectClass}
            {...register("contactMethod")}
          >
            {CONTACT_METHODS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seção 5: Requisitos */}
      <SectionHeading
        icon={<ListChecks size={15} aria-hidden />}
        title="Requisitos"
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="requirements"
          className="text-sm font-medium text-gray-700"
        >
          Requisitos (opcional)
        </label>
        <textarea
          id="requirements"
          rows={4}
          placeholder={
            "Um requisito por linha. Ex:\nExperiência mínima de 6 meses\nDisponibilidade para finais de semana"
          }
          className={textareaClass}
          {...register("requirements")}
        />
        <p className="text-xs text-gray-400">
          Separe cada requisito em uma linha
        </p>
      </div>

      {/* Ações */}
      <div className="mt-8 flex flex-col gap-3">
        {submitError && (
          <div
            role="alert"
            className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium"
          >
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publicando..." : "Publicar vaga"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/painel/vagas")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
