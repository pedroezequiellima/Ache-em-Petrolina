"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  createTaxonomyItem,
  deleteTaxonomyItem,
  renameTaxonomyItem,
  type TaxonomyKind,
} from "@/lib/dashboard/taxonomy";
import { errorNotice, id, text } from "@/lib/form";
import { withNotice, type NoticeKey } from "@/lib/notices";

// Categorias e bairros (só o admin). As ações recebem o tipo num campo escondido e voltam para a
// lista dele com um aviso.

function readKind(formData: FormData): TaxonomyKind {
  const kind = text(formData, "tipo");
  if (kind !== "categorias" && kind !== "bairros") redirect("/painel");
  return kind;
}

// Nome: obrigatório e com até 60 caracteres (mesma regra da API)
function readName(formData: FormData): string | null {
  const name = text(formData, "nome");
  return name && name.length <= 60 ? name : null;
}

function backToList(kind: TaxonomyKind, notice: NoticeKey): never {
  redirect(withNotice(`/painel/${kind}`, notice));
}

export async function createTaxonomyAction(formData: FormData) {
  const session = await requireSession("ADMIN");
  const kind = readKind(formData);
  const name = readName(formData);
  if (!name) backToList(kind, "invalido");

  let notice: NoticeKey = "criado";
  try {
    await createTaxonomyItem(session, kind, name);
    updateTag(CATALOG_TAG);
  } catch (error) {
    notice = errorNotice(error, "duplicado");
  }
  backToList(kind, notice);
}

// Renomear também muda o slug (o endereço usado nos filtros do site)
export async function renameTaxonomyAction(formData: FormData) {
  const session = await requireSession("ADMIN");
  const kind = readKind(formData);
  const itemId = id(formData, "id");
  const name = readName(formData);
  if (!itemId || !name) backToList(kind, "invalido");

  let notice: NoticeKey = "salvo";
  try {
    await renameTaxonomyItem(session, kind, itemId, name);
    updateTag(CATALOG_TAG);
  } catch (error) {
    notice = errorNotice(error, "duplicado");
  }
  backToList(kind, notice);
}

// A API recusa se ainda houver produtos na categoria ou lojas no bairro
export async function deleteTaxonomyAction(formData: FormData) {
  const session = await requireSession("ADMIN");
  const kind = readKind(formData);
  const itemId = id(formData, "id");
  if (!itemId) backToList(kind, "invalido");

  let notice: NoticeKey = "removido";
  try {
    await deleteTaxonomyItem(session, kind, itemId);
    updateTag(CATALOG_TAG);
  } catch (error) {
    notice = errorNotice(error, "em-uso");
  }
  backToList(kind, notice);
}
