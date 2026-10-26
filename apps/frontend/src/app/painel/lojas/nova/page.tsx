import type { Metadata } from "next";
import { StoreForm } from "@/components/dashboard/store-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { listOptions } from "@/lib/dashboard/taxonomy";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Nova loja" };

export default suspended(async function NewStorePage() {
  await requireSession("ADMIN");
  const neighborhoods = await listOptions("bairros");

  return (
    <>
      <PageHeader title="Nova loja" />
      <StoreForm neighborhoods={neighborhoods} isAdmin cancelHref="/painel/lojas" />
    </>
  );
});
