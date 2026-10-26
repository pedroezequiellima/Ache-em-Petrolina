"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { FormError, PasswordField, SubmitButton } from "@/components/auth-fields";
import { resetPasswordAction, type ResetPasswordState } from "@/lib/actions/auth";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.done) {
    return (
      <div role="status" className="text-center">
        <CircleCheck className="mx-auto size-10 text-emerald-600" aria-hidden />
        <p className="mt-3 font-semibold text-stone-900">Senha redefinida</p>
        <p className="mt-1 text-sm text-stone-600">Já pode entrar com a senha nova.</p>
        <Link
          href="/entrar"
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {/* O código do link segue junto com o formulário; quem confere é a API */}
      <input type="hidden" name="token" value={token} />
      <PasswordField
        id="senha"
        name="senha"
        label="Senha nova"
        autoComplete="new-password"
        minLength={8}
        hasError={Boolean(state.error)}
      />
      <PasswordField
        id="confirmacao"
        name="confirmacao"
        label="Repita a senha nova"
        autoComplete="new-password"
        minLength={8}
        hasError={Boolean(state.error)}
      />
      <p className="text-sm text-stone-500">Use de 8 a 72 caracteres.</p>

      <FormError message={state.error} />
      {state.invalidLink ? (
        <Link
          href="/esqueci-senha"
          className="flex h-12 items-center justify-center rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          Pedir um link novo
        </Link>
      ) : (
        <SubmitButton pending={pending} label="Salvar senha nova" pendingLabel="Salvando..." />
      )}
    </form>
  );
}
