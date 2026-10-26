"use client";

import { useEffect } from "react";
import { CloudOff } from "lucide-react";

// Aparece quando uma página não consegue carregar, por exemplo se a API estiver fora do ar
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <CloudOff className="size-12 text-stone-400" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold">Não foi possível carregar esta página</h1>
      <p className="mt-2 text-stone-600">
        Nosso catálogo está fora do ar no momento. Tente de novo em alguns instantes.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
      >
        Tentar de novo
      </button>
    </main>
  );
}
