import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/dashboard/taxonomy-manager";
import { NoticeBanner, PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { listTaxonomy } from "@/lib/dashboard/taxonomy";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Bairros" };

export default suspended(async function NeighborhoodsPage({
  searchParams,
}: PageProps<"/painel/bairros">) {
  await requireSession("ADMIN");
  const [items, params] = await Promise.all([listTaxonomy("bairros"), searchParams]);

  return (
    <>
      <PageHeader
        title="Bairros"
        description="Os bairros de Petrolina usados nas lojas e na busca."
      />
      <NoticeBanner notice={first(params.aviso)} />
      <TaxonomyManager kind="bairros" items={items} />
    </>
  );
});
