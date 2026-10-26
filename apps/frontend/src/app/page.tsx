import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Search, Store } from "lucide-react";
import { CategoryIcon, categoryStyle } from "@/components/category-icon";
import { ProductGrid } from "@/components/product-card";
import { getCategories, getFeaturedProducts, getNeighborhoodsWithStores } from "@/lib/catalog";
import { buildSearchHref } from "@/lib/search-params";

const SUGESTOES = ["tênis", "ventilador", "ração", "celular", "protetor solar"];

const PASSOS = [
  {
    icon: Search,
    title: "Busque",
    text: "Encontre o produto e veja quais lojas de Petrolina têm em estoque.",
  },
  {
    icon: PackageCheck,
    title: "Reserve",
    text: "Informe só nome, WhatsApp e quantidade. Nada de pagar online.",
  },
  {
    icon: Store,
    title: "Retire na loja",
    text: "A loja confirma pelo WhatsApp e você paga na hora da retirada.",
  },
];

export default async function HomePage() {
  const [featured, categories, bairros] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getNeighborhoodsWithStores(),
  ]);

  return (
    <main>
      <section className="bg-linear-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-10 sm:pt-14 sm:pb-16">
          <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">
            O que você procura em Petrolina?
          </h1>
          <p className="mt-3 max-w-xl text-base text-brand-50 sm:text-lg">
            Veja quais lojas da cidade têm o produto, reserve sem pagar online e retire na loja.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-brand-100">Mais buscados:</span>
            {SUGESTOES.map((termo) => (
              <Link
                key={termo}
                href={buildSearchHref({ q: termo })}
                className="rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
              >
                {termo}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-8">
        <section aria-labelledby="categorias">
          <h2 id="categorias" className="text-xl font-bold">
            Categorias
          </h2>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={buildSearchHref({ categoria: category.slug })}
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3 text-center text-sm font-medium text-stone-800 transition hover:border-brand-200 hover:shadow-sm"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-full ${categoryStyle(category.slug).tile}`}
                  >
                    <CategoryIcon slug={category.slug} className="size-6" />
                  </span>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bairros">
          <h2 id="bairros" className="text-xl font-bold">
            Explore por bairro
          </h2>
          <ul className="-mx-4 mt-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
            {bairros.map((bairro) => (
              <li key={bairro.slug} className="shrink-0">
                <Link
                  href={buildSearchHref({ bairro: bairro.slug })}
                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:border-brand-500 hover:text-brand-700"
                >
                  <MapPin className="size-4 text-brand-600" aria-hidden />
                  {bairro.name}
                  <span className="text-xs font-normal text-stone-500">
                    {bairro.storeCount} {bairro.storeCount === 1 ? "loja" : "lojas"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="destaques">
          <div className="flex items-end justify-between gap-4">
            <h2 id="destaques" className="text-xl font-bold">
              Destaques nas lojas
            </h2>
            <Link
              href="/busca"
              className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-4">
            <ProductGrid products={featured} preloadFirst={2} />
          </div>
        </section>

        <section
          aria-labelledby="como-funciona"
          className="rounded-3xl bg-white p-5 ring-1 ring-stone-200 sm:p-8"
        >
          <h2 id="como-funciona" className="text-xl font-bold">
            Como funciona
          </h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {PASSOS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">
                    {i + 1}. {title}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
