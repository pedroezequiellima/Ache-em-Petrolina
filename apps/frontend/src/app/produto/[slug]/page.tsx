import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
  Store,
} from "lucide-react";
import { OpenStatus } from "@/components/open-status";
import { ProductGrid } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { StockBadge } from "@/components/stock-badge";
import { getProductBySlug, getProductSlugs, getStoreProducts } from "@/lib/catalog";
import {
  directionsLink,
  formatPrice,
  formatRating,
  fullAddress,
  groupOpeningHours,
  phoneLink,
  whatsappLink,
} from "@/lib/format";
import { buildSearchHref } from "@/lib/search-params";
import type { ProductListing } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.name} — ${product.store.name}`,
    description: `${formatPrice(product.price)} na ${product.store.name}, bairro ${product.store.neighborhood.name}, Petrolina. ${product.description}`,
    alternates: { canonical: `/produto/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const moreFromStore = await getStoreProducts(product.storeId, product.slug);
  const { store } = product;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-4 pb-28 lg:pb-8">
      <ProductJsonLd product={product} />

      <nav aria-label="Navegação estrutural" className="text-sm text-stone-500">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-brand-700 hover:underline">
              Início
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="size-4 shrink-0" aria-hidden />
            <Link
              href={buildSearchHref({ categoria: product.categorySlug })}
              className="hover:text-brand-700 hover:underline"
            >
              {product.category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <section aria-labelledby="produto">
            {product.brand && (
              <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
                {product.brand}
              </p>
            )}
            <h1 id="produto" className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
              {product.oldPrice && (
                <>
                  <p className="pb-1 text-stone-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </p>
                  <span className="mb-1 rounded-md bg-brand-100 px-2 py-0.5 text-sm font-bold text-brand-800">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-stone-500">Pagamento direto na loja, na retirada.</p>

            <div className="mt-3">
              <StockBadge stock={product.stock} />
            </div>

            <div className="mt-5 hidden gap-2 lg:flex">
              <ContactActions product={product} />
            </div>
          </section>

          <section
            aria-labelledby="loja"
            className="rounded-2xl bg-white p-4 ring-1 ring-stone-200"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Store className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500">Disponível na loja</p>
                <h2 id="loja" className="font-semibold">
                  <Link
                    href={`/loja/${store.slug}`}
                    className="hover:text-brand-700 hover:underline"
                  >
                    {store.name}
                  </Link>
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-600">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span>
                    <strong className="text-stone-900">{formatRating(store.rating)}</strong> (
                    {store.reviewCount} avaliações)
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4 border-t border-stone-100 pt-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-stone-400" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{store.neighborhood.name}</p>
                  <address className="text-stone-600 not-italic">{fullAddress(store)}</address>
                  <a
                    href={directionsLink(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline"
                  >
                    <Navigation className="size-4" aria-hidden />
                    Como chegar
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-stone-400" aria-hidden />
                <div className="flex-1">
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
          </section>

          <section aria-labelledby="descricao">
            <h2 id="descricao" className="text-lg font-semibold">
              Descrição
            </h2>
            <p className="mt-2 text-stone-700">{product.description}</p>
            {product.details.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {moreFromStore.length > 0 && (
        <section aria-labelledby="mais-da-loja" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 id="mais-da-loja" className="text-xl font-bold">
              Mais da {store.name}
            </h2>
            <Link
              href={`/loja/${store.slug}`}
              className="shrink-0 text-sm font-semibold text-brand-700 hover:underline"
            >
              Ver a loja
            </Link>
          </div>
          <div className="mt-4">
            <ProductGrid products={moreFromStore} />
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          <ContactActions product={product} />
        </div>
      </div>
    </main>
  );
}

// Reservar (quando há estoque), WhatsApp e Ligar. Usado na coluna do desktop e na barra do celular
function ContactActions({ product }: { product: ProductListing }) {
  const canReserve = product.stock !== "esgotado";

  return (
    <>
      {canReserve && (
        <Link
          href={`/produto/${product.slug}/reservar`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          <CalendarCheck className="size-5" aria-hidden />
          Reservar
        </Link>
      )}
      <a
        href={whatsappLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={canReserve ? "Falar com a loja no WhatsApp" : undefined}
        className={`flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${canReserve ? "" : "flex-1"}`}
      >
        <MessageCircle className="size-5" aria-hidden />
        <span className={canReserve ? "hidden sm:inline" : ""}>Falar com a loja</span>
      </a>
      <a
        href={phoneLink(product.store.phone)}
        aria-label={`Ligar para ${product.store.name}: ${product.store.phone}`}
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 font-semibold text-stone-800 hover:bg-stone-50"
      >
        <Phone className="size-5" aria-hidden />
        <span className="hidden sm:inline">Ligar</span>
      </a>
    </>
  );
}

const AVAILABILITY = {
  disponivel: "https://schema.org/InStock",
  poucas: "https://schema.org/LimitedAvailability",
  esgotado: "https://schema.org/OutOfStock",
} as const;

function ProductJsonLd({ product }: { product: ProductListing }) {
  const { store } = product;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "BRL",
      availability: AVAILABILITY[product.stock],
      seller: {
        "@type": "Store",
        name: store.name,
        telephone: store.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: store.address,
          addressLocality: "Petrolina",
          addressRegion: "PE",
          postalCode: store.cep,
          addressCountry: "BR",
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
