"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { EmailField, FormError, SubmitButton } from "@/components/auth-fields";
import { forgotPasswordAction, type ForgotPasswordState } from "@/lib/actions/auth";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.sent) {
    // Mesma mensagem exista ou não a conta: a tela não revela quem está cadastrado
    return (
      <div role="status" className="text-center">
        <MailCheck className="mx-auto size-10 text-emerald-600" aria-hidden />
        <p className="mt-3 font-semibold text-stone-900">Confira seu e-mail</p>
        <p className="mt-1 text-sm text-stone-600">
          Se <strong className="break-all text-stone-800">{state.email}</strong> estiver cadastrado,
          enviamos um link para criar uma senha nova. O link vale 30 minutos e só funciona uma vez.
        </p>
        <p className="mt-3 text-sm text-stone-500">
          Não chegou? Olhe a caixa de spam ou peça de novo em alguns minutos.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <EmailField
        label="E-mail da conta"
        key={state.email}
        defaultValue={state.email}
        hasError={Boolean(state.error)}
      />
      <FormError message={state.error} />
      <SubmitButton pending={pending} label="Enviar link" pendingLabel="Enviando..." />
    </form>
  );
}
