import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check, SearchX } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { ProductGrid } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";
import {
  getCategories,
  getCategory,
  getNeighborhood,
  getNeighborhoods,
  searchProducts,
} from "@/lib/catalog";
import { buildSearchHref, parseSearchParams } from "@/lib/search-params";
import type { SearchFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Buscar produtos",
  description: "Busque produtos por nome, categoria e bairro nas lojas de Petrolina.",
};

type RawSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function SearchPage({ searchParams }: PageProps<"/busca">) {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-4">
      <h1 className="sr-only">Buscar produtos em Petrolina</h1>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchResults({ searchParams }: { searchParams: RawSearchParams }) {
  const filters = parseSearchParams(await searchParams);
  const [results, neighborhoods] = await Promise.all([searchProducts(filters), getNeighborhoods()]);

  return (
    <>
      <SearchForm key={buildSearchHref(filters)} neighborhoods={neighborhoods} defaults={filters} />
      <CategoryChips filters={filters} />

      <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600" aria-live="polite">
          <ResultSummary filters={filters} count={results.length} />
        </p>
        <Link
          href={buildSearchHref({ ...filters, estoque: !filters.estoque })}
          aria-current={filters.estoque ? "true" : undefined}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
            filters.estoque
              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
          }`}
        >
          {filters.estoque && <Check className="size-4" aria-hidden />}
          Só com estoque
        </Link>
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} preloadFirst={2} />
      ) : (
        <EmptyState filters={filters} />
      )}
    </>
  );
}

async function CategoryChips({ filters }: { filters: SearchFilters }) {
  const chips = [{ slug: "", name: "Todas" }, ...(await getCategories())];

  return (
    <nav aria-label="Categorias" className="mt-3">
      <ul className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map(({ slug, name }) => {
          const active = filters.categoria === slug;
          return (
            <li key={slug || "todas"} className="shrink-0">
              <Link
                href={buildSearchHref({ ...filters, categoria: slug })}
                aria-current={active ? "true" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                {slug && <CategoryIcon slug={slug} className="size-4" />}
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

async function ResultSummary({ filters, count }: { filters: SearchFilters; count: number }) {
  const [category, bairro] = await Promise.all([
    getCategory(filters.categoria),
    getNeighborhood(filters.bairro),
  ]);

  return (
    <>
      <strong className="text-stone-900">{count}</strong>{" "}
      {count === 1 ? "produto encontrado" : "produtos encontrados"}
      {filters.q && <> para “{filters.q}”</>}
      {category && <> em {category.name}</>}
      {bairro && <> no bairro {bairro.name}</>}
    </>
  );
}

async function EmptyState({ filters }: { filters: SearchFilters }) {
  const bairro = await getNeighborhood(filters.bairro);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <SearchX className="size-10 text-stone-400" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold">Nenhum produto encontrado</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-600">
        Tente outro termo, escolha outro bairro ou remova alguns filtros.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {bairro && (
          <Link
            href={buildSearchHref({ ...filters, bairro: "" })}
            className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Buscar em todos os bairros
          </Link>
        )}
        <Link
          href="/busca"
          className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          Limpar filtros
        </Link>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando resultados" className="animate-pulse">
      <div className="h-12 rounded-xl bg-stone-200" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="h-12 rounded-xl bg-stone-200" />
        <div className="h-12 rounded-xl bg-stone-200" />
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-stone-200" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
            <div className="aspect-square bg-stone-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 rounded bg-stone-200" />
              <div className="h-5 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
