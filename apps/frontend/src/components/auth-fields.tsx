"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";

// Campos usados nas telas de entrar, esqueci minha senha e redefinir senha

const ERROR_ID = "erro-formulario";

const iconClass =
  "pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-stone-400";

const inputClass =
  "h-12 w-full rounded-xl border border-stone-200 bg-white pr-3 pl-10 text-base text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none aria-invalid:border-red-400";

type FieldProps = { label: string; hasError?: boolean } & ComponentProps<"input">;

function errorProps(hasError?: boolean) {
  return {
    "aria-invalid": hasError ? true : undefined,
    "aria-describedby": hasError ? ERROR_ID : undefined,
  };
}

export function EmailField({ label, hasError, id = "email", ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
      </label>
      <div className="relative mt-1">
        <Mail className={iconClass} aria-hidden />
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          {...errorProps(hasError)}
          {...props}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function PasswordField({ label, hasError, id, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
      </label>
      <div className="relative mt-1">
        <Lock className={iconClass} aria-hidden />
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          maxLength={72}
          {...errorProps(hasError)}
          {...props}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? "Esconder senha" : "Mostrar senha"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  return (
    <p
      id={ERROR_ID}
      role="alert"
      className={message ? "rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800" : ""}
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-wait disabled:opacity-70"
    >
      {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
      {pending ? pendingLabel : label}
    </button>
  );
}
