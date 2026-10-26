"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  updateStock,
  type ProductInput,
} from "@/lib/dashboard/products";
import {
  apiErrorMessage,
  checkbox,
  commaList,
  errorNotice,
  failedState,
  id,
  lines,
  money,
  optionalText,
  text,
  type FormState,
} from "@/lib/form";
import { withNotice, type NoticeKey } from "@/lib/notices";
import type { StockLevel } from "@/lib/types";

// Server Actions dos produtos. Cada uma confere a sessão de novo (não confia na tela) e a API
// confere a permissão em cada chamada. Depois de mudar algo, updateTag(CATALOG_TAG) faz o site
// mostrar a mudança na hora.

const STOCK_LEVELS: StockLevel[] = ["disponivel", "poucas", "esgotado"];

function isStock(value: string): value is StockLevel {
  return STOCK_LEVELS.includes(value as StockLevel);
}

export async function saveProductAction(
  previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const fail = (error: string) => failedState(previous, formData, error);

  const productId = id(formData, "id");
  // O lojista só cadastra na própria loja, seja qual for o valor que chegar do formulário
  const storeId =
    session.user.role === "LOJISTA" ? (session.user.store?.id ?? null) : id(formData, "lojaId");
  const categoryId = id(formData, "categoriaId");
  const price = money(formData, "preco");
  const oldPrice = money(formData, "precoAntigo");
  const stock = text(formData, "estoque");

  if (!text(formData, "nome")) return fail("Digite o nome do produto.");
  if (!storeId) return fail("Escolha a loja.");
  if (!categoryId) return fail("Escolha a categoria.");
  if (price === null || Number.isNaN(price) || price < 0) {
    return fail("Digite o preço, por exemplo 129,90.");
  }
  if (oldPrice !== null && (Number.isNaN(oldPrice) || oldPrice < 0)) {
    return fail("O preço antigo precisa ser um valor, por exemplo 159,90.");
  }
  if (!isStock(stock)) return fail("Escolha a situação do estoque.");

  const input: ProductInput = {
    name: text(formData, "nome"),
    brand: optionalText(formData, "marca"),
    description: optionalText(formData, "descricao"),
    details: lines(formData, "detalhes"),
    price,
    oldPrice,
    images: lines(formData, "fotos"),
    tags: commaList(formData, "tags"),
    featured: checkbox(formData, "destaque"),
    stock,
    storeId,
    categoryId,
  };

  try {
    if (productId) await updateProduct(session, productId, input);
    else await createProduct(session, input);
  } catch (error) {
    return fail(apiErrorMessage(error));
  }

  updateTag(CATALOG_TAG);
  redirect(withNotice("/painel/produtos", productId ? "salvo" : "criado"));
}

// Volta para a lista mantendo a loja escolhida no filtro (admin)
function backToList(formData: FormData, notice: NoticeKey): never {
  redirect(
    withNotice("/painel/produtos", notice, { loja: id(formData, "filtroLoja") ?? undefined }),
  );
}

export async function updateStockAction(formData: FormData) {
  const session = await requireSession();
  const productId = id(formData, "id");
  const stock = text(formData, "estoque");
  let notice: NoticeKey = "estoque";

  if (!productId || !isStock(stock)) {
    notice = "invalido";
  } else {
    try {
      await updateStock(session, productId, stock);
      updateTag(CATALOG_TAG);
    } catch (error) {
      notice = errorNotice(error);
    }
  }
  backToList(formData, notice);
}

export async function deleteProductAction(formData: FormData) {
  const session = await requireSession();
  const productId = id(formData, "id");
  let notice: NoticeKey = "removido";

  if (!productId) {
    notice = "invalido";
  } else {
    try {
      await deleteProduct(session, productId);
      updateTag(CATALOG_TAG);
    } catch (error) {
      notice = errorNotice(error);
    }
  }
  backToList(formData, notice);
}
