"use client";

import { useRouter } from "next/navigation";
import { useRef, type FormEvent, type ReactNode } from "react";
import { ArrowUpDown, ChevronDown, MapPin, Search } from "lucide-react";
import { buildSearchHref, DEFAULT_FILTERS } from "@/lib/search-params";
import type { Neighborhood, SearchFilters, SortOrder } from "@/lib/types";

type Props = {
  neighborhoods: Neighborhood[];
  defaults?: SearchFilters;
};

export function SearchForm({ neighborhoods, defaults = DEFAULT_FILTERS }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    router.push(
      buildSearchHref({
        q: String(data.get("q") ?? "").trim(),
        categoria: String(data.get("categoria") ?? ""),
        bairro: String(data.get("bairro") ?? ""),
        estoque: data.get("estoque") === "1",
        ordem: (data.get("ordem") as SortOrder | null) ?? "relevancia",
      }),
    );
  }

  const applyOnChange = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} role="search" action="/busca" method="get" onSubmit={handleSubmit}>
      {defaults.categoria && <input type="hidden" name="categoria" value={defaults.categoria} />}
      {defaults.estoque && <input type="hidden" name="estoque" value="1" />}

      <div className="space-y-2">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">O que você procura?</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={defaults.q}
              placeholder="Ex.: tênis Nike 42"
              enterKeyHint="search"
              autoComplete="off"
              maxLength={100}
              className="h-12 w-full rounded-xl border border-stone-200 bg-white pr-3 pl-10 text-base text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
          </label>
          <SubmitButton />
        </div>

        <div className="grid grid-cols-[6fr_5fr] gap-2">
          <SelectField icon={<MapPin className="size-4" aria-hidden />}>
            <select
              name="bairro"
              defaultValue={defaults.bairro}
              onChange={applyOnChange}
              aria-label="Bairro"
              className={selectClass}
            >
              <option value="">Todos os bairros</option>
              {neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
          </SelectField>
          <SelectField icon={<ArrowUpDown className="size-4" aria-hidden />}>
            <select
              name="ordem"
              defaultValue={defaults.ordem}
              onChange={applyOnChange}
              aria-label="Ordenar por"
              className={selectClass}
            >
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </SelectField>
        </div>
      </div>
    </form>
  );
}

const selectClass =
  "h-12 w-full appearance-none truncate rounded-xl border border-stone-200 bg-white pr-7 pl-9 text-sm text-stone-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none";

function SelectField({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400">
        {icon}
      </span>
      {children}
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-400"
        aria-hidden
      />
    </div>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="h-12 shrink-0 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
    >
      Buscar
    </button>
  );
}
