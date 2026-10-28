import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { ReservationForm } from "@/components/reservation-form";
import { StockBadge } from "@/components/stock-badge";
import { getProductBySlug, getProductSlugs } from "@/lib/catalog";
import { formatPrice, isExternalImage, whatsappLink } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  if (slugs.length === 0) {
    // Cache Components exige pelo menos 1 resultado durante o build sem API
    return [{ slug: "__build-fallback__" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produto/[slug]/reservar">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return {
    title: product ? `Reservar ${product.name}` : "Produto não encontrado",
    robots: { index: false },
  };
}

export default async function ReservePage({ params }: PageProps<"/produto/[slug]/reservar">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const { store } = product;
  const soldOut = product.stock === "esgotado";

  return (
    <main className="mx-auto max-w-xl px-4 pt-4 pb-8">
      <Link
        href={`/produto/${product.slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-brand-700"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Voltar para o produto
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Reservar</h1>
      <p className="mt-1 text-stone-600">
        Sem pagar online: você reserva, a loja confirma pelo WhatsApp e você paga na retirada.
      </p>

      <section
        aria-label="Produto"
        className="mt-5 flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              unoptimized={isExternalImage(product.images[0])}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium text-stone-900">{product.name}</p>
          <p className="text-lg font-bold">{formatPrice(product.price)}</p>
          <p className="flex items-center gap-1 truncate text-sm text-stone-600">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {store.name} · {store.neighborhood.name}
          </p>
        </div>
      </section>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-5">
        {soldOut ? (
          <div className="space-y-3">
            <StockBadge stock="esgotado" />
            <p className="text-stone-700">
              Este produto esgotou e não pode ser reservado agora. Pergunte à loja quando chega
              mais.
            </p>
            <a
              href={whatsappLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800"
            >
              Falar com a loja
            </a>
          </div>
        ) : (
          <ReservationForm
            productId={product.id}
            productSlug={product.slug}
            storeName={store.name}
          />
        )}
      </div>

      <p className="mt-4 text-sm text-stone-500">
        Seu nome e WhatsApp vão só para a {store.name}, para combinar a retirada. O Ache em
        Petrolina não usa esses dados para mais nada.
      </p>
    </main>
  );
}
