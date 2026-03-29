"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSession } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";

export const LoginForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // await api.post('/auth/login', data)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSession({ token: "fake-token", role: "EMPLOYER", name: data.phone });
      router.push("/painel");
    } catch {
      setServerError("Telefone ou senha incorretos.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {serverError && (
        <p
          role="alert"
          className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error"
        >
          {serverError}
        </p>
      )}

      <Input
        id="phone"
        label="WhatsApp"
        type="tel"
        placeholder="(22) 99999-9999"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Input
        id="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>

      <div className="flex flex-col items-center gap-2 pt-1 text-sm">
        <p className="text-gray-600">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-primary">
            Criar conta
          </Link>
        </p>
        <span className="cursor-default text-gray-400">Esqueceu a senha?</span>
      </div>
    </form>
  );
};
