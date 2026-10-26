import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Moldura das telas de conta (entrar, esqueci minha senha, redefinir senha)
export function AuthPage({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto flex max-w-sm flex-col px-4 pt-10 pb-8 sm:pt-16">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
        <Icon className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-stone-600">{description}</p>

      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-stone-200">{children}</div>

      {footer && <div className="mt-4 text-sm text-stone-500">{footer}</div>}
    </main>
  );
}
