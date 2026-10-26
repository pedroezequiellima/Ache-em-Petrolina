import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StoreForm } from "@/components/dashboard/store-form";
import { NoticeBanner, PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/dashboard/stores";
import { listOptions } from "@/lib/dashboard/taxonomy";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Minha loja" };

// Dados da loja do lojista logado (o admin edita as lojas em /painel/lojas)
export default suspended(async function MyStorePage({ searchParams }: PageProps<"/painel/loja">) {
  const session = await requireSession();
  if (session.user.role === "ADMIN") redirect("/painel/lojas");

  const storeId = session.user.store?.id;
  if (!storeId) notFound();
  const [store, neighborhoods] = await Promise.all([
    getStore(session, storeId),
    listOptions("bairros"),
  ]);
  if (!store) notFound();

  return (
    <>
      <PageHeader title="Minha loja" description="Estes dados aparecem para os clientes no site." />
      <NoticeBanner notice={first((await searchParams).aviso)} />
      <p className="mb-4 text-sm text-stone-600">
        Página da loja:{" "}
        <Link href={`/loja/${store.slug}`} className="font-medium text-brand-700 hover:underline">
          /loja/{store.slug}
        </Link>
      </p>
      <StoreForm store={store} neighborhoods={neighborhoods} isAdmin={false} cancelHref="/painel" />
    </>
  );
});
