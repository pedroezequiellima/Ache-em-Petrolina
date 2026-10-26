import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireSession } from "@/lib/auth";
import { getProduct } from "@/lib/dashboard/products";
import { listStores } from "@/lib/dashboard/stores";
import { listOptions } from "@/lib/dashboard/taxonomy";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Editar produto" };

export default suspended(async function EditProductPage({
  params,
}: PageProps<"/painel/produtos/[id]">) {
  const session = await requireSession();
  const productId = Number((await params).id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const [product, categories, stores] = await Promise.all([
    getProduct(session, productId),
    listOptions("categorias"),
    isAdmin ? listStores() : undefined,
  ]);
  // Também quando o produto é de outra loja (lojista)
  if (!product) notFound();

  return (
    <>
      <PageHeader title="Editar produto" description={product.name} />
      <ProductForm product={product} categories={categories} stores={stores} />
    </>
  );
});
