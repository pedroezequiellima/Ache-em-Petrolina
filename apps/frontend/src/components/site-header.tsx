import Link from "next/link";
import { MapPin, Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Ache em Petrolina, página inicial"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand-700 text-white">
            <MapPin className="size-5" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="leading-none">
            <span className="block text-[11px] font-medium tracking-wide text-stone-500 uppercase">
              Ache em
            </span>
            <span className="block text-base font-bold text-stone-900">Petrolina</span>
          </span>
        </Link>

        <Link
          href="/busca"
          className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-brand-500 hover:text-brand-700"
        >
          <Search className="size-4" aria-hidden />
          Buscar
        </Link>
      </div>
    </header>
  );
}
