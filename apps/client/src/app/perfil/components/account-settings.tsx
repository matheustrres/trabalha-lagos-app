"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/use-auth.hook";
import { clearSession, getSession, setSession } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";
import { usersService } from "@/lib/services/users.service";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";

const accountSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  city: z.string().min(1, "Selecione sua cidade."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z
      .string()
      .min(8, "Use pelo menos 8 caracteres.")
      .regex(/[a-z]/, "Inclua uma letra minúscula.")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula.")
      .regex(/[0-9]/, "Inclua um número.")
      .regex(/[^A-Za-z0-9]/, "Inclua um símbolo."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const emailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  currentPassword: z.string().min(1, "Informe sua senha atual."),
});

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Mínimo de 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "Pelo menos 1 letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lowercase", label: "Pelo menos 1 letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "Pelo menos 1 número", test: (value: string) => /\d/.test(value) },
  { id: "symbol", label: "Pelo menos 1 símbolo", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

type AccountFormValues = z.infer<typeof accountSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordField = "current" | "new" | "confirm";
const DELETE_CONFIRMATION = "EXCLUIR MINHA CONTA";

interface PasswordVisibilityToggleProps {
  fieldId: string;
  label: string;
  visible: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const PasswordVisibilityToggle = ({ fieldId, label, visible, disabled, onToggle }: PasswordVisibilityToggleProps) => (
  <button
    type="button"
    className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
    aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label}`}
    aria-controls={fieldId}
    aria-pressed={visible}
    disabled={disabled}
    onClick={onToggle}
  >
    {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
  </button>
);

export const AccountSettings = () => {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailPasswordVisible, setEmailPasswordVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: account, isLoading, isError } = useQuery({
    queryKey: ["account", "me"],
    queryFn: usersService.getMyAccount,
  });

  const accountDefaults = useMemo<AccountFormValues>(() => ({
    name: account?.name ?? session?.user.name ?? "",
    city: account?.city ?? session?.user.city ?? "",
  }), [account, session?.user.city, session?.user.name]);

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: accountDefaults,
  });

  useEffect(() => accountForm.reset(accountDefaults), [accountDefaults, accountForm]);

  useEffect(() => {
    if (accountNotice !== "Dados da conta atualizados.") return;

    const timeoutId = window.setTimeout(() => setAccountNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [accountNotice]);

  useEffect(() => {
    if (!passwordNotice) return;

    const timeoutId = window.setTimeout(() => setPasswordNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [passwordNotice]);

  useEffect(() => {
    if (!emailNotice) return;

    const timeoutId = window.setTimeout(() => setEmailNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [emailNotice]);

  const accountMutation = useMutation({
    mutationFn: usersService.updateMyAccount,
    onSuccess: (updated) => {
      queryClient.setQueryData(["account", "me"], updated);
      const stored = getSession();
      if (stored) {
        setSession({ ...stored, user: { ...stored.user, name: updated.name, city: updated.city } });
      }
      accountForm.reset({ name: updated.name, city: updated.city ?? "" });
      setAccountNotice("Dados da conta atualizados.");
    },
    onError: () => setAccountNotice("Não foi possível salvar. Revise os dados e tente novamente."),
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "", currentPassword: "" },
  });
  const newEmailValue = emailForm.watch("email", "");
  const emailCurrentPasswordValue = emailForm.watch("currentPassword", "");
  const isEmailChanged = newEmailValue.trim().toLowerCase() !== account?.email.trim().toLowerCase();

  const emailMutation = useMutation({
    mutationFn: usersService.updateMyEmail,
    onSuccess: (updated) => {
      queryClient.setQueryData(["account", "me"], updated);
      const stored = getSession();
      if (stored) {
        setSession({ ...stored, user: { ...stored.user, email: updated.email } });
      }
      emailForm.reset();
      setEmailPasswordVisible(false);
      setEmailOpen(false);
      setEmailNotice("E-mail atualizado. Use o novo endereço nos próximos acessos.");
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const currentPasswordValue = passwordForm.watch("currentPassword", "");
  const newPasswordValue = passwordForm.watch("newPassword", "");
  const confirmPasswordValue = passwordForm.watch("confirmPassword", "");
  const togglePasswordVisibility = (field: PasswordField) => {
    setVisiblePasswordFields((visible) => ({ ...visible, [field]: !visible[field] }));
  };

  const passwordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: (updatedSession) => {
      setSession(updatedSession);
      passwordForm.reset();
      setVisiblePasswordFields({ current: false, new: false, confirm: false });
      setPasswordError(null);
      setPasswordNotice("Senha alterada. Este dispositivo continua conectado.");
    },
    onError: (error) => {
      setPasswordNotice(null);
      setPasswordError(error instanceof Error ? error.message : "Não foi possível alterar a senha." );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteMyAccount,
    onSuccess: async () => {
      clearSession();
      await queryClient.clear();
      router.replace("/");
    },
  });

  if (isLoading) return <p className="py-5 text-sm text-gray-500">Carregando dados da conta...</p>;
  if (isError || !account) return <p role="alert" className="py-5 text-sm text-error">Não foi possível carregar os dados da conta.</p>;

  const isEmployer = account.role === "EMPLOYER";

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Dados da conta</h2>
          <p className="mt-1 text-sm text-gray-500">Informações usadas para identificar você na plataforma.</p>
        </div>
        <form className="space-y-4" onSubmit={accountForm.handleSubmit((data) => {
          setAccountNotice(null);
          accountMutation.mutate(data);
        })}>
          <Input id="account-name" label="Nome" autoComplete="name" maxLength={100} error={accountForm.formState.errors.name?.message} {...accountForm.register("name")} />
          <Input
            id="account-email"
            label="E-mail de acesso"
            type="email"
            value={account.email}
            readOnly
            className="bg-surface text-gray-500"
            endAdornment={(
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="size-8 p-0"
                aria-label="Alterar e-mail"
                title="Alterar e-mail"
                onClick={() => {
                  emailForm.reset({ email: account.email, currentPassword: "" });
                  emailMutation.reset();
                  setEmailPasswordVisible(false);
                  setEmailOpen(true);
                }}
              >
                <Pencil aria-hidden="true" size={13} />
              </Button>
            )}
          />
          {emailNotice && <p role="status" className="-mt-2 text-sm text-gray-600">{emailNotice}</p>}
          <div className="flex flex-col gap-1">
            <label htmlFor="account-city" className="text-sm font-medium text-gray-700">Cidade</label>
            <select id="account-city" className="h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" {...accountForm.register("city")}>
              <option value="">Selecione sua cidade</option>
              {LAGOS_CITIES.map((city) => <option key={city.slug} value={city.name}>{city.name}</option>)}
            </select>
            {accountForm.formState.errors.city?.message && <p role="alert" className="text-sm text-error">{accountForm.formState.errors.city.message}</p>}
          </div>
          {accountNotice && <p role="status" className="text-sm text-gray-600">{accountNotice}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={accountMutation.isPending || !accountForm.formState.isDirty}>
              {accountMutation.isPending ? "Salvando..." : "Salvar dados"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Segurança</h2>
          <p className="mt-1 text-sm text-gray-500">Ao trocar a senha, outros dispositivos precisarão entrar novamente.</p>
        </div>
        <form className="space-y-4" onSubmit={passwordForm.handleSubmit((data) => {
          setPasswordNotice(null);
          setPasswordError(null);
          passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
        })}>
          <Input
            id="current-password"
            label="Senha atual"
            type={visiblePasswordFields.current ? "text" : "password"}
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            endAdornment={(
              <PasswordVisibilityToggle
                fieldId="current-password"
                label="senha atual"
                visible={visiblePasswordFields.current}
                disabled={!currentPasswordValue || passwordMutation.isPending}
                onToggle={() => togglePasswordVisibility("current")}
              />
            )}
            {...passwordForm.register("currentPassword")}
          />
          <Input
            id="new-password"
            label="Nova senha"
            type={visiblePasswordFields.new ? "text" : "password"}
            autoComplete="new-password"
            error={passwordForm.formState.errors.newPassword?.message}
            endAdornment={(
              <PasswordVisibilityToggle
                fieldId="new-password"
                label="nova senha"
                visible={visiblePasswordFields.new}
                disabled={!newPasswordValue || passwordMutation.isPending}
                onToggle={() => togglePasswordVisibility("new")}
              />
            )}
            {...passwordForm.register("newPassword")}
          />
          <ul className="-mt-2 grid gap-1 text-xs sm:grid-cols-2" aria-label="Requisitos da nova senha">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const isMet = requirement.test(newPasswordValue);
              return (
                <li
                  key={requirement.id}
                  aria-label={`${requirement.label}: ${isMet ? "atendido" : "pendente"}`}
                  className={`flex items-center gap-2 ${isMet ? "text-success" : "text-gray-500"}`}
                >
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${isMet ? "bg-success" : "bg-gray-300"}`} />
                  {requirement.label}
                </li>
              );
            })}
          </ul>
          <Input
            id="confirm-password"
            label="Confirme a nova senha"
            type={visiblePasswordFields.confirm ? "text" : "password"}
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            endAdornment={(
              <PasswordVisibilityToggle
                fieldId="confirm-password"
                label="confirmação da senha"
                visible={visiblePasswordFields.confirm}
                disabled={!confirmPasswordValue || passwordMutation.isPending}
                onToggle={() => togglePasswordVisibility("confirm")}
              />
            )}
            {...passwordForm.register("confirmPassword")}
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="submit" disabled={!passwordForm.formState.isValid || passwordMutation.isPending}>
              {passwordMutation.isPending ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
          {passwordError && <p role="alert" className="text-sm text-error">{passwordError}</p>}
          {passwordNotice && <p role="status" className="text-sm text-gray-600">{passwordNotice}</p>}
        </form>
      </Card>

      <Card className="border-error/30">
        <h2 className="font-semibold text-error">Zona de risco</h2>
        <p className="mt-1 text-sm text-gray-600">Excluir sua conta é uma ação permanente.</p>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>Excluir conta</Button>
        </div>
      </Card>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir conta permanentemente">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {isEmployer
              ? "A exclusão removerá também sua empresa, vagas e interesses relacionados."
              : "A exclusão removerá também seu perfil profissional e interesses relacionados."}
            {" "}Essa ação não pode ser desfeita.
          </p>
          <Input id="delete-current-password" label="Senha atual" type="password" autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
          <Input id="delete-confirmation" label={`Digite ${DELETE_CONFIRMATION}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          {deleteMutation.isError && <p role="alert" className="text-sm text-error">{deleteMutation.error.message}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button type="button" variant="danger" disabled={deletePassword.length === 0 || confirmation !== DELETE_CONFIRMATION || deleteMutation.isPending} onClick={() => deleteMutation.mutate({ currentPassword: deletePassword, confirmation })}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={emailOpen}
        onClose={() => {
          if (emailMutation.isPending) return;
          setEmailOpen(false);
          emailForm.reset();
        }}
        title="Alterar e-mail de acesso"
      >
        <form className="space-y-4" onSubmit={emailForm.handleSubmit((data) => emailMutation.mutate(data))}>
          <p className="text-sm text-gray-600">Confirme sua senha para trocar o e-mail usado para entrar na plataforma.</p>
          <Input
            id="new-account-email"
            label="Novo e-mail"
            type="email"
            autoComplete="email"
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register("email")}
          />
          {newEmailValue.trim() && !isEmailChanged && (
            <p role="status" className="-mt-2 text-sm text-gray-500">
              Digite um e-mail diferente do atual.
            </p>
          )}
          <Input
            id="confirm-email-password"
            label="Senha da conta"
            type={emailPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            error={emailForm.formState.errors.currentPassword?.message}
            endAdornment={(
              <PasswordVisibilityToggle
                fieldId="confirm-email-password"
                label="senha da conta"
                visible={emailPasswordVisible}
                disabled={!emailForm.watch("currentPassword") || emailMutation.isPending}
                onToggle={() => setEmailPasswordVisible((visible) => !visible)}
              />
            )}
            {...emailForm.register("currentPassword")}
          />
          {emailMutation.isError && <p role="alert" className="text-sm text-error">{emailMutation.error.message || "Não foi possível alterar o e-mail."}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={emailMutation.isPending} onClick={() => {
              setEmailOpen(false);
              emailForm.reset();
            }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!emailForm.formState.isValid || !isEmailChanged || !emailCurrentPasswordValue || emailMutation.isPending}
            >
              {emailMutation.isPending ? "Salvando..." : "Confirmar e-mail"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
