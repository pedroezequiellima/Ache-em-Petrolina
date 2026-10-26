import "server-only";
import { ApiError, apiRequest } from "@/lib/api";
import { clientIp } from "@/lib/auth";
import { toReservation, type ApiReserva } from "@/lib/mappers";
import type { Reservation } from "@/lib/types";

// Reserva feita pelo cliente na página do produto (rota pública da API). O IP do visitante
// segue junto para o limite de 10 reservas por minuto valer por pessoa, não para o site todo.

export interface ReservationInput {
  productId: number;
  name: string;
  whatsapp: string;
  quantity: number;
}

export type ReservationResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: "sold-out" | "not-found" | "rate-limited" | "error" };

export async function createReservation(input: ReservationInput): Promise<ReservationResult> {
  try {
    const reserva = await apiRequest<ApiReserva>("/reservas", {
      method: "POST",
      body: {
        produtoId: input.productId,
        nomeCliente: input.name,
        whatsappCliente: input.whatsapp,
        quantidade: input.quantity,
        // O formulário só envia depois que a pessoa marca o aceite
        aceiteLgpd: true,
      },
      clientIp: await clientIp(),
    });
    return { ok: true, reservation: toReservation(reserva) };
  } catch (error) {
    if (error instanceof ApiError) {
      // 400 aqui é produto esgotado (os campos já foram conferidos antes de chamar a API)
      if (error.status === 400) return { ok: false, reason: "sold-out" };
      if (error.status === 404) return { ok: false, reason: "not-found" };
      if (error.status === 429) return { ok: false, reason: "rate-limited" };
    }
    console.error(error);
    return { ok: false, reason: "error" };
  }
}
