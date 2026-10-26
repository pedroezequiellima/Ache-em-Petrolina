"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";

// Erro inesperado numa página do painel (ex: a API fora do ar)
export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-stone-200">
      <CircleAlert className="size-10 text-stone-400" aria-hidden />
      <h1 className="mt-3 text-lg font-semibold">Não foi possível carregar esta parte do painel</h1>
      <p className="mt-1 text-sm text-stone-600">Tente de novo em alguns instantes.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 rounded-xl bg-brand-700 px-5 py-2.5 font-semibold text-white hover:bg-brand-800"
      >
        Tentar de novo
      </button>
    </div>
  );
}
