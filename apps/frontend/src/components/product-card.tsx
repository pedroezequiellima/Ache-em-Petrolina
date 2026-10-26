import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { StockBadge } from "@/components/stock-badge";
import { formatPrice, isExternalImage } from "@/lib/format";
import type { ProductListing } from "@/lib/types";

export function ProductCard({
  product,
  preload = false,
}: {
  product: ProductListing;
  preload?: boolean;
}) {
  const soldOut = product.stock === "esgotado";

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-brand-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div className="relative aspect-square bg-stone-100">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            unoptimized={isExternalImage(product.images[0])}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            preload={preload}
            className={`object-cover transition group-hover:scale-[1.02] ${soldOut ? "opacity-60 grayscale" : ""}`}
          />
        )}
        <StockBadge stock={product.stock} className="absolute top-2 left-2 shadow-sm" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-stone-900">{product.name}</h3>

        <div className="mt-auto pt-1">
          {product.oldPrice && (
            <p className="text-xs text-stone-500 line-through">{formatPrice(product.oldPrice)}</p>
          )}
          <p className="text-lg font-bold text-stone-900">{formatPrice(product.price)}</p>
        </div>

        <p className="truncate text-xs font-medium text-stone-700">{product.store.name}</p>
        <p className="flex items-center gap-1 text-xs text-stone-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{product.store.neighborhood.name}</span>
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  preloadFirst = 0,
}: {
  products: ProductListing[];
  preloadFirst?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} preload={i < preloadFirst} />
        </li>
      ))}
    </ul>
  );
}
