"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { createStore, deleteStore, updateStore, type StoreInput } from "@/lib/dashboard/stores";
import {
  apiErrorMessage,
  checkbox,
  errorNotice,
  failedState,
  id,
  optionalText,
  text,
  whatsappDigits,
  type FormState,
} from "@/lib/form";
import { withNotice, type NoticeKey } from "@/lib/notices";
import type { DayHours } from "@/lib/types";

// Server Actions das lojas. Criar e apagar: só o admin. Editar: o admin ou o lojista dono.

const HOUR = /^([01]\d|2[0-3]):[0-5]\d$/;

// Os 7 dias do formulário: "aberto-1", "abre-1", "fecha-1"... (0 = domingo)
function readHours(formData: FormData): (DayHours | null)[] | string {
  const hours: (DayHours | null)[] = [];
  for (let day = 0; day < 7; day++) {
    if (!checkbox(formData, `aberto-${day}`)) {
      hours.push(null);
      continue;
    }
    const open = text(formData, `abre-${day}`);
    const close = text(formData, `fecha-${day}`);
    if (!HOUR.test(open) || !HOUR.test(close)) return "Preencha a hora de abrir e de fechar.";
    if (close <= open) return "A hora de fechar precisa ser depois da hora de abrir.";
    hours.push({ open, close });
  }
  return hours;
}

export async function saveStoreAction(previous: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const isAdmin = session.user.role === "ADMIN";
  const fail = (error: string) => failedState(previous, formData, error);

  const storeId = id(formData, "id");
  // Só o admin cria lojas; o lojista só edita a dele
  if (!isAdmin && (!storeId || storeId !== session.user.store?.id)) {
    return fail("Você não tem permissão para fazer isso.");
  }

  const hours = readHours(formData);
  const neighborhoodId = id(formData, "bairroId");
  const whatsapp = whatsappDigits(text(formData, "whatsapp"));

  if (!text(formData, "nome")) return fail("Digite o nome da loja.");
  if (!/^\d{12,13}$/.test(whatsapp)) {
    return fail("Digite o WhatsApp com DDD, por exemplo (87) 98888-7777.");
  }
  if (!text(formData, "endereco")) return fail("Digite o endereço.");
  if (!neighborhoodId) return fail("Escolha o bairro.");
  if (typeof hours === "string") return fail(hours);

  const input: StoreInput = {
    name: text(formData, "nome"),
    description: optionalText(formData, "descricao"),
    whatsapp,
    phone: optionalText(formData, "telefone"),
    email: optionalText(formData, "email"),
    instagram: optionalText(formData, "instagram"),
    address: text(formData, "endereco"),
    cep: optionalText(formData, "cep"),
    neighborhoodId,
    logoUrl: optionalText(formData, "logoUrl"),
    hours,
  };
  if (isAdmin) {
    const rating = text(formData, "avaliacao").replace(",", ".");
    input.rating = rating ? Number(rating) : null;
    input.reviewCount = Number(text(formData, "totalAvaliacoes") || 0);
  }

  try {
    if (storeId) await updateStore(session, storeId, input);
    else await createStore(session, input);
  } catch (error) {
    return fail(apiErrorMessage(error));
  }

  updateTag(CATALOG_TAG);
  const notice = storeId ? "salvo" : "criado";
  redirect(withNotice(isAdmin ? "/painel/lojas" : "/painel/loja", notice));
}

export async function deleteStoreAction(formData: FormData) {
  const session = await requireSession("ADMIN");
  const storeId = id(formData, "id");
  let notice: NoticeKey = "removido";

  if (!storeId) {
    notice = "invalido";
  } else {
    try {
      await deleteStore(session, storeId);
      updateTag(CATALOG_TAG);
    } catch (error) {
      notice = errorNotice(error);
    }
  }
  redirect(withNotice("/painel/lojas", notice));
}
