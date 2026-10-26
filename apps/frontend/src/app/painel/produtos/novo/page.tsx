import type { Metadata } from "next";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { listStores } from "@/lib/dashboard/stores";
import { listOptions } from "@/lib/dashboard/taxonomy";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Novo produto" };

export default suspended(async function NewProductPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === "ADMIN";
  const [categories, stores] = await Promise.all([
    listOptions("categorias"),
    isAdmin ? listStores() : undefined,
  ]);

  return (
    <>
      <PageHeader
        title="Novo produto"
        description={isAdmin ? undefined : `Será cadastrado na ${session.user.store?.name}.`}
      />
      <ProductForm categories={categories} stores={stores} />
    </>
  );
});
