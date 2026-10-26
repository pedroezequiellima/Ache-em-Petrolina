import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <SearchX className="size-12 text-stone-400" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold">Não encontramos esta página</h1>
      <p className="mt-2 text-stone-600">
        O produto pode ter sido removido pela loja ou o link está incorreto.
      </p>
      <Link
        href="/busca"
        className="mt-6 rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
      >
        Buscar produtos
      </Link>
    </main>
  );
}
