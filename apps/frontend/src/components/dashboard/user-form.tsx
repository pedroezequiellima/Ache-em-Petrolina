"use client";

import { useActionState, useState } from "react";
import { PasswordField } from "@/components/auth-fields";
import { FormAlert, SaveButton, SelectField, TextField } from "@/components/form-fields";
import { createUserAction } from "@/lib/actions/users";
import type { FormState } from "@/lib/form";
import type { Option, Role } from "@/lib/types";

const initialState: FormState = {};

// Cria o acesso de um lojista (preso a uma loja) ou de outro administrador
export function UserForm({ stores }: { stores: Option[] }) {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const values = state.values ?? { papel: "LOJISTA" };
  const [role, setRole] = useState<Role>(values.papel === "ADMIN" ? "ADMIN" : "LOJISTA");

  return (
    <form key={state.attempt} action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nome" name="nome" required maxLength={120} defaultValue={values.nome} />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="off"
          required
          defaultValue={values.email}
        />
        <SelectField
          label="Tipo de conta"
          name="papel"
          defaultValue={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          <option value="LOJISTA">Lojista (gerencia uma loja)</option>
          <option value="ADMIN">Administrador (gerencia tudo)</option>
        </SelectField>
        {role === "LOJISTA" && (
          <SelectField label="Loja" name="lojaId" defaultValue={values.lojaId ?? ""}>
            <option value="" disabled>
              Escolha...
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
        )}
      </div>
      <div className="max-w-sm">
        <PasswordField
          id="senha"
          name="senha"
          label="Senha inicial (8 a 72 caracteres)"
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-sm text-stone-500">
          Passe a senha para a pessoa por um canal seguro e peça para ela trocar em Minha conta.
        </p>
      </div>
      <FormAlert message={state.error} />
      <SaveButton pending={pending}>Criar acesso</SaveButton>
    </form>
  );
}
