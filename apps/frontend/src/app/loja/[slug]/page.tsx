import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, MapPin, MessageCircle, Navigation, Phone, Star, Store } from "lucide-react";
import { OpenStatus } from "@/components/open-status";
import { ProductGrid } from "@/components/product-card";
import { getStoreBySlug, getStoreSlugs } from "@/lib/catalog";
import {
  directionsLink,
  formatRating,
  fullAddress,
  groupOpeningHours,
  phoneLink,
  storeWhatsappLink,
} from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getStoreSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const store = await getStoreBySlug((await params).slug);
  if (!store) return { title: "Loja não encontrada" };

  return {
    title: store.name,
    description:
      store.description ||
      `${store.name}, no bairro ${store.neighborhood.name}, Petrolina. Veja os produtos e reserve.`,
    alternates: { canonical: `/loja/${store.slug}` },
  };
}

export default async function StorePage({ params }: PageProps<"/loja/[slug]">) {
  const store = await getStoreBySlug((await params).slug);
  if (!store) notFound();

  // Disponíveis primeiro, esgotados por último
  const products = [...store.products].sort(
    (a, b) => Number(a.stock === "esgotado") - Number(b.stock === "esgotado"),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6">
      <section aria-labelledby="loja" className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700">
            <Store className="size-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 id="loja" className="text-2xl font-bold tracking-tight">
              {store.name}
            </h1>
            {store.rating > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-600">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                <strong className="text-stone-900">{formatRating(store.rating)}</strong> (
                {store.reviewCount} avaliações)
              </p>
            )}
            {store.description && <p className="mt-2 text-stone-700">{store.description}</p>}
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-stone-400" aria-hidden />
            <div>
              <p className="font-medium text-stone-900">{store.neighborhood.name}</p>
              <address className="text-stone-600 not-italic">{fullAddress(store)}</address>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-stone-400" aria-hidden />
            <div>
              <OpenStatus hours={store.hours} />
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-stone-600">
                {groupOpeningHours(store.hours).map(({ days, hours }) => (
                  <div key={days} className="contents">
                    <dt>{days}</dt>
                    <dd className={hours === "Fechado" ? "text-stone-400" : ""}>{hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={storeWhatsappLink(store)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800"
          >
            <MessageCircle className="size-5" aria-hidden />
            WhatsApp
          </a>
          {store.phone && (
            <a
              href={phoneLink(store.phone)}
              className="flex h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 font-semibold text-stone-800 hover:bg-stone-50"
            >
              <Phone className="size-5" aria-hidden />
              Ligar
            </a>
          )}
          <a
            href={directionsLink(store)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 font-semibold text-stone-800 hover:bg-stone-50"
          >
            <Navigation className="size-5" aria-hidden />
            Como chegar
          </a>
        </div>
      </section>

      <section aria-labelledby="produtos" className="mt-8">
        <h2 id="produtos" className="text-xl font-bold">
          Produtos ({products.length})
        </h2>
        <div className="mt-4">
          {products.length > 0 ? (
            <ProductGrid products={products} preloadFirst={2} />
          ) : (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center text-stone-600">
              Esta loja ainda não cadastrou produtos.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
