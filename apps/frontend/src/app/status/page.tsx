import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CircleCheck, CircleX, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { getSystemStatus } from "@/lib/system";

export const metadata: Metadata = {
  title: "Status do sistema",
  robots: { index: false },
};

// Health check: consulta a API (GET /health) a cada visita, sem cache
export default function StatusPage() {
  return (
    <main className="mx-auto max-w-md px-4 pt-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Activity className="size-6 text-brand-700" aria-hidden />
        Status do sistema
      </h1>
      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-2xl bg-stone-200" />}>
        <StatusPanel />
      </Suspense>
    </main>
  );
}

async function StatusPanel() {
  // Sempre na hora da visita (nunca do cache nem do build)
  await connection();
  const status = await getSystemStatus();
  const items = [
    { label: "Site", ok: true },
    { label: "API", ok: status.api },
    { label: "Banco de dados", ok: status.database },
  ];
  const allOk = items.every((item) => item.ok);

  return (
    <>
      <p
        className={`mt-4 rounded-xl px-4 py-3 font-semibold ${
          allOk ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
        }`}
        role="status"
      >
        {allOk ? "Tudo funcionando." : "Há um problema: parte do site pode não carregar."}
      </p>
      <ul className="mt-4 divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
        {items.map(({ label, ok }) => (
          <li key={label} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium text-stone-800">{label}</span>
            <span
              className={`flex items-center gap-1.5 text-sm font-semibold ${ok ? "text-emerald-700" : "text-red-700"}`}
            >
              {ok ? (
                <CircleCheck className="size-5" aria-hidden />
              ) : (
                <CircleX className="size-5" aria-hidden />
              )}
              {ok ? "No ar" : "Fora do ar"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-stone-500">
        Verificado em {formatDateTime(status.checkedAt)}
        {status.latencyMs !== null && <> · a API respondeu em {status.latencyMs} ms</>}
      </p>
    </>
  );
}
