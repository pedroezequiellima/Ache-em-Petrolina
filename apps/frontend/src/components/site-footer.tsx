import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-8 text-sm text-stone-500">
        <p className="font-semibold text-stone-800">Ache em Petrolina</p>
        <p>Encontre, reserve sem pagar online e retire nas lojas de Petrolina - PE.</p>
        <p>Projeto da Academia Softex DevOps.</p>
        <p className="pt-2">
          <Link href="/entrar" className="font-medium text-stone-700 hover:text-brand-700">
            Área do lojista
          </Link>
        </p>
      </div>
    </footer>
  );
}
