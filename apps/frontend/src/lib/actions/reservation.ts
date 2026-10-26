"use server";

import { id, text, whatsappDigits } from "@/lib/form";
import { createReservation } from "@/lib/reservations";
import type { Reservation } from "@/lib/types";

// Reserva feita pelo cliente (formulário público da página do produto)

export interface ReservationState {
  error?: string;
  values?: { nome: string; whatsapp: string; quantidade: string };
  attempt?: number;
  reservation?: Reservation;
}

const MESSAGES = {
  "sold-out": "Este produto esgotou. Fale com a loja para saber quando chega mais.",
  "not-found": "Este produto não está mais disponível.",
  "rate-limited": "Muitas reservas seguidas. Espere um minuto e tente de novo.",
  error: "Não foi possível enviar a reserva agora. Tente de novo em alguns instantes.",
};

export async function reserveAction(
  previous: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const values = {
    nome: text(formData, "nome"),
    whatsapp: text(formData, "whatsapp"),
    quantidade: text(formData, "quantidade"),
  };
  const fail = (error: string): ReservationState => ({
    error,
    values,
    attempt: (previous.attempt ?? 0) + 1,
  });

  const productId = id(formData, "produtoId");
  const whatsapp = whatsappDigits(values.whatsapp);
  const quantity = Number(values.quantidade);

  if (!productId) return fail(MESSAGES["not-found"]);
  if (values.nome.length < 2 || values.nome.length > 120) return fail("Digite o seu nome.");
  if (!/^\d{12,13}$/.test(whatsapp)) {
    return fail("Digite o WhatsApp com DDD, por exemplo (87) 98888-7777.");
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return fail("A quantidade precisa ser de 1 a 99.");
  }
  if (formData.get("aceite") !== "on") {
    return fail("Para reservar, marque que concorda em enviar seus dados para a loja.");
  }

  const result = await createReservation({
    productId,
    name: values.nome,
    whatsapp,
    quantity,
  });
  if (!result.ok) return fail(MESSAGES[result.reason]);
  return { reservation: result.reservation };
}
