import Link from "next/link";
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Plus } from "lucide-react";
import { isNoticeKey, NOTICES } from "@/lib/notices";
import type { ReservationStatus } from "@/lib/types";

// Peças visuais que as páginas do painel repetem

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-stone-600">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus className="size-4" aria-hidden />
          {action.label}
        </Link>
      )}
    </div>
  );
}

// Aviso vindo da URL (?aviso=salvo). Chaves desconhecidas são ignoradas
export function NoticeBanner({ notice }: { notice: string }) {
  if (!isNoticeKey(notice)) return null;
  const { tone, text } = NOTICES[notice];
  const success = tone === "success";
  const Icon = success ? CircleCheck : CircleAlert;

  return (
    <p
      role={success ? "status" : "alert"}
      className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
        success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {text}
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center text-stone-600">
      {children}
    </div>
  );
}

export const RESERVATION_LABELS: Record<ReservationStatus, string> = {
  NOVA: "Nova",
  CONFIRMADA: "Confirmada",
  RETIRADA: "Retirada",
  CANCELADA: "Cancelada",
  EXPIRADA: "Expirada",
};

const RESERVATION_COLORS: Record<ReservationStatus, string> = {
  NOVA: "bg-brand-100 text-brand-800",
  CONFIRMADA: "bg-sky-100 text-sky-800",
  RETIRADA: "bg-emerald-100 text-emerald-800",
  CANCELADA: "bg-stone-200 text-stone-700",
  EXPIRADA: "bg-stone-200 text-stone-500",
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${RESERVATION_COLORS[status]}`}
    >
      {RESERVATION_LABELS[status]}
    </span>
  );
}

export const smallButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-50";

export const dangerButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50";
