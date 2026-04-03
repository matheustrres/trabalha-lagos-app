"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { setSession } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";
import { RoleSelector } from "./role-selector";
import {
  candidateSchema,
  employerSchema,
  type CandidateFormData,
  type EmployerFormData,
} from "../schemas/register.schema";

type Role = "CANDIDATE" | "EMPLOYER";
type FormData = CandidateFormData | EmployerFormData;

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatDocument = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  const n = digits.length;
  if (n <= 11) {
    // CPF: 000.000.000-00
    if (n <= 3) return digits;
    if (n <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (n <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  // CNPJ: 00.000.000/0001-00
  if (n <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  if (n <= 13)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

type RegisterReturn = ReturnType<
  ReturnType<typeof useForm<FormData>>["register"]
>;

const withFormat =
  (format: (v: string) => string) => (field: RegisterReturn) => ({
    ...field,
    onChange: (e: { target: HTMLInputElement; type?: string }) => {
      e.target.value = format(e.target.value);
      return field.onChange(e);
    },
  });

const withPhoneFormat = withFormat(formatPhone);
const withDocumentFormat = withFormat(formatDocument);

const SEGMENTS = [
  "Restaurante",
  "Pousada/Hotel",
  "Comércio",
  "Construção",
  "Serviços",
  "Tecnologia",
  "Outro",
];

export const RegisterForm = () => {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = role === "CANDIDATE" ? candidateSchema : employerSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleRoleChange = (next: Role) => {
    setRole(next);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const payload = {
        name: data.name,
        phone: data.phone.replace(/\D/g, ""),
        email: data.email || undefined,
        password: data.password,
        city: data.city,
        role,
        ...(role === "EMPLOYER" && {
          document:
            (data as EmployerFormData).document?.replace(/\D/g, "") ?? "",
        }),
      };
      const response = await authService.register(payload);
      setSession(response);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(role === "EMPLOYER" ? "/painel" : "/");
    } catch (err) {
      const error = err as { status?: number };
      if (error.status === 409) {
        setServerError("Este telefone já está cadastrado.");
      } else if (error.status === 429) {
        setServerError(
          "Muitas requisições. Aguarde alguns segundos e tente novamente.",
        );
      } else {
        setServerError("Erro ao criar conta. Tente novamente.");
      }
    }
  };

  const fieldErrors = errors as Record<string, { message?: string }>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <RoleSelector value={role} onChange={handleRoleChange} />

      {serverError && (
        <p
          role="alert"
          className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error"
        >
          {serverError}
        </p>
      )}

      <Input
        id="name"
        label="Nome completo"
        autoComplete="name"
        error={fieldErrors.name?.message}
        {...register("name")}
      />

      <Input
        id="phone"
        label="WhatsApp"
        type="tel"
        placeholder="(22) 99999-9999"
        autoComplete="tel"
        inputMode="numeric"
        error={fieldErrors.phone?.message}
        {...withPhoneFormat(register("phone"))}
      />

      <Input
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="Opcional, para recuperação de conta"
        error={fieldErrors.email?.message}
        {...register("email")}
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
          <option value="">Selecione uma cidade</option>
          {LAGOS_CITIES.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        {fieldErrors.city?.message && (
          <p role="alert" className="text-sm text-error">
            {fieldErrors.city.message}
          </p>
        )}
      </div>

      <Input
        id="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password?.message}
        {...register("password")}
      />

      <Input
        id="confirmPassword"
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {role === "EMPLOYER" && (
        <>
          <div className="relative my-1 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-gray-400">
              Dados da empresa
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Input
            id="companyName"
            label="Nome da empresa"
            error={fieldErrors.companyName?.message}
            {...register("companyName")}
          />

          <Input
            id="document"
            label="CNPJ/CPF"
            placeholder="Opcional, ajuda na verificação"
            inputMode="numeric"
            error={fieldErrors.document?.message}
            {...withDocumentFormat(register("document"))}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="segment"
              className="text-sm font-medium text-gray-700"
            >
              Segmento
            </label>
            <select
              id="segment"
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              {...register("segment")}
            >
              <option value="">Selecione um segmento</option>
              {SEGMENTS.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="whatsappBusiness"
            label="WhatsApp da empresa"
            type="tel"
            placeholder="(22) 99999-9999"
            autoComplete="tel"
            inputMode="numeric"
            error={fieldErrors.whatsappBusiness?.message}
            {...withPhoneFormat(register("whatsappBusiness"))}
          />
        </>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
};
