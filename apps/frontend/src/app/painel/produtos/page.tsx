import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import {
  dangerButton,
  EmptyState,
  NoticeBanner,
  PageHeader,
  smallButton,
} from "@/components/dashboard/ui";
import { StockBadge } from "@/components/stock-badge";
import { deleteProductAction, updateStockAction } from "@/lib/actions/products";
import { requireSession } from "@/lib/auth";
import { listProducts } from "@/lib/dashboard/products";
import { listStores } from "@/lib/dashboard/stores";
import { formatPrice, isExternalImage } from "@/lib/format";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Produtos" };

export default suspended(async function ProductsPage({
  searchParams,
}: PageProps<"/painel/produtos">) {
  const session = await requireSession();
  const params = await searchParams;
  const isAdmin = session.user.role === "ADMIN";
  // Filtro por loja: só o admin usa (o lojista vê sempre a dele)
  const storeFilter = isAdmin ? Number(first(params.loja)) || undefined : undefined;

  const [products, stores] = await Promise.all([
    listProducts(session, storeFilter),
    isAdmin ? listStores() : null,
  ]);

  return (
    <>
      <PageHeader
        title="Produtos"
        description={
          isAdmin ? "Produtos de todas as lojas." : `Produtos da ${session.user.store?.name}.`
        }
        action={{ href: "/painel/produtos/novo", label: "Novo produto" }}
      />
      <NoticeBanner notice={first(params.aviso)} />

      {stores && (
        <form className="mb-4 flex flex-wrap items-end gap-2">
          <label className="text-sm font-medium text-stone-800">
            Loja
            <select
              name="loja"
              defaultValue={storeFilter ?? ""}
              className="mt-1 block h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm"
            >
              <option value="">Todas as lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={smallButton}>
            Filtrar
          </button>
        </form>
      )}

      {products.length === 0 ? (
        <EmptyState>
          Nenhum produto cadastrado ainda.{" "}
          <Link href="/painel/produtos/novo" className="font-medium text-brand-700 underline">
            Cadastrar o primeiro
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      unoptimized={isExternalImage(product.images[0])}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{product.name}</p>
                  <p className="text-sm text-stone-600">
                    {formatPrice(product.price)} · {product.category.name}
                    {isAdmin && <> · {product.store.name}</>}
                  </p>
                  <StockBadge stock={product.stock} className="mt-1" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Mudar o estoque rápido, sem abrir o formulário */}
                <form action={updateStockAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="filtroLoja" value={storeFilter ?? ""} />
                  <select
                    name="estoque"
                    defaultValue={product.stock}
                    aria-label={`Estoque de ${product.name}`}
                    className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-sm"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="poucas">Poucas unidades</option>
                    <option value="esgotado">Esgotado</option>
                  </select>
                  <button type="submit" className={smallButton}>
                    Atualizar
                  </button>
                </form>
                <Link href={`/painel/produtos/${product.id}`} className={smallButton}>
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Link>
                <Link
                  href={`/produto/${product.slug}`}
                  className={smallButton}
                  aria-label={`Ver ${product.name} no site`}
                >
                  <ExternalLink className="size-4" aria-hidden />
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="filtroLoja" value={storeFilter ?? ""} />
                  <ConfirmSubmit
                    message={`Remover "${product.name}"? As reservas dele também serão apagadas.`}
                    className={dangerButton}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="sr-only">Remover {product.name}</span>
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
});
