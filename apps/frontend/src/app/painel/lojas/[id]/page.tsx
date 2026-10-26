import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreForm } from "@/components/dashboard/store-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/dashboard/stores";
import { listOptions } from "@/lib/dashboard/taxonomy";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Editar loja" };

export default suspended(async function EditStorePage({ params }: PageProps<"/painel/lojas/[id]">) {
  const session = await requireSession("ADMIN");
  const storeId = Number((await params).id);
  if (!Number.isInteger(storeId) || storeId <= 0) notFound();

  const [store, neighborhoods] = await Promise.all([
    getStore(session, storeId),
    listOptions("bairros"),
  ]);
  if (!store) notFound();

  return (
    <>
      <PageHeader title="Editar loja" description={store.name} />
      <StoreForm store={store} neighborhoods={neighborhoods} isAdmin cancelHref="/painel/lojas" />
    </>
  );
});
