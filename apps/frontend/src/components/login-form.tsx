"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EmailField, FormError, PasswordField, SubmitButton } from "@/components/auth-fields";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <EmailField
        label="E-mail"
        // key: o React limpa o formulário depois do envio; assim o e-mail digitado volta
        key={state.email}
        defaultValue={state.email}
        hasError={hasError}
      />

      <div>
        <PasswordField
          id="senha"
          name="senha"
          label="Senha"
          autoComplete="current-password"
          hasError={hasError}
        />
        <Link
          href="/esqueci-senha"
          className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <FormError message={state.error} />
      <SubmitButton pending={pending} label="Entrar" pendingLabel="Entrando..." />
    </form>
  );
}
