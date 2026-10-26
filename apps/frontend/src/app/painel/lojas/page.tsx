import type { Metadata } from "next";
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
import { deleteStoreAction } from "@/lib/actions/stores";
import { requireSession } from "@/lib/auth";
import { listStores } from "@/lib/dashboard/stores";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Lojas" };

export default suspended(async function StoresPage({ searchParams }: PageProps<"/painel/lojas">) {
  await requireSession("ADMIN");
  const [stores, params] = await Promise.all([listStores(), searchParams]);

  return (
    <>
      <PageHeader
        title="Lojas"
        description="Depois de cadastrar a loja, crie o acesso do lojista em Usuários."
        action={{ href: "/painel/lojas/nova", label: "Nova loja" }}
      />
      <NoticeBanner notice={first(params.aviso)} />

      {stores.length === 0 ? (
        <EmptyState>Nenhuma loja cadastrada.</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
          {stores.map((store) => (
            <li key={store.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-stone-900">{store.name}</p>
                <p className="text-sm text-stone-600">
                  {store.neighborhood} · {store.productCount}{" "}
                  {store.productCount === 1 ? "produto" : "produtos"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/painel/lojas/${store.id}`} className={smallButton}>
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Link>
                <Link
                  href={`/loja/${store.slug}`}
                  className={smallButton}
                  aria-label={`Ver ${store.name} no site`}
                >
                  <ExternalLink className="size-4" aria-hidden />
                </Link>
                <form action={deleteStoreAction}>
                  <input type="hidden" name="id" value={store.id} />
                  <ConfirmSubmit
                    message={`Remover a loja "${store.name}"? Isso apaga também os produtos, as reservas e os lojistas dela.`}
                    className={dangerButton}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="sr-only">Remover {store.name}</span>
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
