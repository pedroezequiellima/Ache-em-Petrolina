import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/dashboard/taxonomy-manager";
import { NoticeBanner, PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { listTaxonomy } from "@/lib/dashboard/taxonomy";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Categorias" };

export default suspended(async function CategoriesPage({
  searchParams,
}: PageProps<"/painel/categorias">) {
  await requireSession("ADMIN");
  const [items, params] = await Promise.all([listTaxonomy("categorias"), searchParams]);

  return (
    <>
      <PageHeader title="Categorias" description="Os atalhos da página inicial e da busca." />
      <NoticeBanner notice={first(params.aviso)} />
      <TaxonomyManager kind="categorias" items={items} />
    </>
  );
});
