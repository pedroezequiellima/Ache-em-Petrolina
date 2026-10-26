import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

// Campos de formulário do painel e da reserva (as telas de conta usam auth-fields.tsx)

export const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none disabled:bg-stone-100";

function Label({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-800">
      {label}
      {hint && <span className="ml-1 font-normal text-stone-500">({hint})</span>}
    </label>
  );
}

type FieldProps = { label: string; hint?: string; name: string; className?: string };

export function TextField({
  label,
  hint,
  name,
  className = "",
  ...props
}: FieldProps & Omit<ComponentProps<"input">, "name">) {
  return (
    <div className={className}>
      <Label htmlFor={name} label={label} hint={hint} />
      <input id={name} name={name} {...props} className={`${inputClass} mt-1 h-11`} />
    </div>
  );
}

export function TextArea({
  label,
  hint,
  name,
  className = "",
  ...props
}: FieldProps & Omit<ComponentProps<"textarea">, "name">) {
  return (
    <div className={className}>
      <Label htmlFor={name} label={label} hint={hint} />
      <textarea id={name} name={name} rows={4} {...props} className={`${inputClass} mt-1 py-2`} />
    </div>
  );
}

export function SelectField({
  label,
  hint,
  name,
  className = "",
  children,
  ...props
}: FieldProps & Omit<ComponentProps<"select">, "name">) {
  return (
    <div className={className}>
      <Label htmlFor={name} label={label} hint={hint} />
      <select id={name} name={name} {...props} className={`${inputClass} mt-1 h-11`}>
        {children}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  children,
  ...props
}: { label: ReactNode; name: string; children?: ReactNode } & Omit<
  ComponentProps<"input">,
  "name" | "type"
>) {
  return (
    <label className="flex items-start gap-3 text-sm text-stone-700">
      <input
        type="checkbox"
        name={name}
        {...props}
        className="mt-0.5 size-5 shrink-0 rounded border-stone-300 accent-brand-700"
      />
      <span>
        {label}
        {children}
      </span>
    </label>
  );
}

export function FormAlert({ message }: { message?: string }) {
  return (
    <p
      role="alert"
      className={message ? "rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800" : ""}
    >
      {message}
    </p>
  );
}

export function SaveButton({
  pending,
  children,
  pendingLabel = "Salvando...",
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-wait disabled:opacity-70"
    >
      {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
      {pending ? pendingLabel : children}
    </button>
  );
}

// Bloco com título dentro de um formulário grande
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-semibold text-stone-900" aria-hidden>
        {title}
      </h2>
      {children}
    </fieldset>
  );
}
