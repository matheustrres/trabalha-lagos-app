"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Path } from "react-hook-form";
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
type ApiRequestError = {
  status?: number;
  message?: string;
  detail?: string[];
};

const mapApiValidationMessageToField = (
  message: string,
  role: Role,
): Path<FormData> | null => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("telefone") || normalizedMessage.includes("whatsapp")) {
    return "phone";
  }

  if (normalizedMessage.includes("e-mail") || normalizedMessage.includes("email")) {
    return "email";
  }

  if (normalizedMessage.includes("senha")) {
    return "password";
  }

  if (normalizedMessage.includes("cidade")) {
    return "city";
  }

  if (normalizedMessage.includes("cnpj") && role === "EMPLOYER") {
    return "document" as Path<FormData>;
  }

  if (normalizedMessage.includes("nome") && role === "EMPLOYER") {
    return "companyName" as Path<FormData>;
  }

  if (normalizedMessage.includes("nome")) {
    return "name";
  }

  return null;
};

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

  if (n <= 2) return digits;
  if (n <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (n <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (n <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Mínimo de 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "Pelo menos 1 letra maiúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "Pelo menos 1 letra minúscula",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Pelo menos 1 número",
    test: (value: string) => /\d/.test(value),
  },
  {
    id: "symbol",
    label: "Pelo menos 1 símbolo",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

const PASSWORD_STRENGTH_LEVELS = [
  { label: "Muito fraca", color: "bg-error", textColor: "text-error" },
  { label: "Fraca", color: "bg-error", textColor: "text-error" },
  { label: "Média", color: "bg-amber-500", textColor: "text-amber-600" },
  { label: "Boa", color: "bg-primary-light", textColor: "text-primary" },
  { label: "Forte", color: "bg-success", textColor: "text-success" },
  { label: "Muito forte", color: "bg-success", textColor: "text-success" },
] as const;

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
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");
  const metPasswordRequirements = PASSWORD_REQUIREMENTS.filter((requirement) =>
    requirement.test(passwordValue),
  ).length;
  const strength = PASSWORD_STRENGTH_LEVELS[metPasswordRequirements];
  const passwordCriteriaReached =
    metPasswordRequirements === PASSWORD_REQUIREMENTS.length;

  const handleRoleChange = (next: Role) => {
    setRole(next);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    clearErrors();

    try {
      const payload = {
        name: data.name,
        phone: data.phone.replace(/\D/g, ""),
        email: data.email,
        password: data.password,
        city: data.city,
        role,
        ...(role === "EMPLOYER" && {
          document: (data as EmployerFormData).document.replace(/\D/g, ""),
        }),
      };
      const response = await authService.register(payload);
      setSession(response);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(role === "EMPLOYER" ? "/painel" : "/");
    } catch (err) {
      const error = err as ApiRequestError;
      if (error.status === 409) {
        const message = "Este telefone já está cadastrado.";
        setError("phone", { type: "server", message });
        setServerError(
          "Não foi possível concluir o cadastro. Confira os campos destacados.",
        );
      } else if (error.status === 429) {
        setServerError(
          "Muitas requisições. Aguarde alguns segundos e tente novamente.",
        );
      } else if (error.status === 400) {
        const messages =
          error.detail && error.detail.length > 0
            ? error.detail
            : error.message
              ? [error.message]
              : [];

        let hasMappedFieldError = false;

        messages.forEach((message) => {
          const field = mapApiValidationMessageToField(message, role);

          if (field) {
            setError(field, { type: "server", message });
            hasMappedFieldError = true;
          }
        });

        setServerError(
          hasMappedFieldError
            ? "Não foi possível concluir o cadastro. Confira os campos destacados."
            : messages[0] ||
                "Dados inválidos. Revise os campos e tente novamente.",
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
        placeholder="seuemail@exemplo.com"
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

      <div className="rounded-xl border border-border bg-surface px-3 py-2">
        <p className="text-xs text-gray-600">Força da senha</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${strength.color}`}
            style={{
              width: `${(metPasswordRequirements / PASSWORD_REQUIREMENTS.length) * 100}%`,
            }}
          />
        </div>
        <p className={`mt-2 text-xs font-medium ${strength.textColor}`}>
          {strength.label}
        </p>

        <ul className="mt-2 flex flex-col gap-1">
          {PASSWORD_REQUIREMENTS.map((requirement) => {
            const isMet = requirement.test(passwordValue);

            return (
              <li
                key={requirement.id}
                className={`text-xs ${isMet ? "text-success" : "text-gray-500"}`}
              >
                {isMet ? "✓" : "•"} {requirement.label}
              </li>
            );
          })}
        </ul>

        <p
          className={`mt-2 text-xs font-medium ${passwordCriteriaReached ? "text-success" : "text-error"}`}
        >
          {passwordCriteriaReached
            ? "A senha atende aos requisitos mínimos de segurança."
            : "A senha ainda não atende aos requisitos mínimos de segurança."}
        </p>
      </div>

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
            label="CNPJ"
            placeholder="00.000.000/0000-00"
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
