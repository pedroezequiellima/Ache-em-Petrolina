"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { FormError, PasswordField, SubmitButton } from "@/components/auth-fields";
import { changePasswordAction, type ChangePasswordState } from "@/lib/actions/auth";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} className="max-w-sm space-y-4" noValidate>
      {state.done && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CircleCheck className="size-5" aria-hidden />
          Senha alterada.
        </p>
      )}
      <PasswordField
        id="senhaAtual"
        name="senhaAtual"
        label="Senha atual"
        autoComplete="current-password"
        hasError={hasError}
      />
      <PasswordField
        id="senha"
        name="senha"
        label="Senha nova (8 a 72 caracteres)"
        autoComplete="new-password"
        minLength={8}
        hasError={hasError}
      />
      <PasswordField
        id="confirmacao"
        name="confirmacao"
        label="Repita a senha nova"
        autoComplete="new-password"
        minLength={8}
        hasError={hasError}
      />
      <FormError message={state.error} />
      <SubmitButton pending={pending} label="Trocar senha" pendingLabel="Salvando..." />
    </form>
  );
}
