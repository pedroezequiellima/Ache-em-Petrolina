import "server-only";
import { apiRequest, queryString } from "@/lib/api";
import type { Session } from "@/lib/auth";
import { toReservation, type ApiReserva } from "@/lib/mappers";
import type { ReservationStatus } from "@/lib/types";

// Reservas no painel. Nome e WhatsApp do cliente são dados pessoais (LGPD): a API só devolve
// ao lojista as reservas da loja dele e ao admin todas.

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "NOVA",
  "CONFIRMADA",
  "RETIRADA",
  "CANCELADA",
  "EXPIRADA",
];

// Para quais status cada status pode ir (as mesmas regras da API, em reservas.service.ts).
// EXPIRADA a própria API aplica quando o prazo passa
export const NEXT_STATUSES: Record<ReservationStatus, ReservationStatus[]> = {
  NOVA: ["CONFIRMADA", "CANCELADA"],
  CONFIRMADA: ["RETIRADA", "CANCELADA"],
  RETIRADA: [],
  CANCELADA: [],
  EXPIRADA: [],
};

export function isReservationStatus(value: unknown): value is ReservationStatus {
  return RESERVATION_STATUSES.includes(value as ReservationStatus);
}

export async function listReservations(
  { token }: Session,
  filters: { status?: ReservationStatus; storeId?: number },
) {
  const query = queryString({ status: filters.status, lojaId: filters.storeId });
  const reservas = await apiRequest<ApiReserva[]>(`/reservas${query}`, { accessToken: token });
  return reservas.map(toReservation);
}

export function updateReservationStatus({ token }: Session, id: number, status: ReservationStatus) {
  return apiRequest(`/reservas/${id}/status`, {
    method: "PATCH",
    body: { status },
    accessToken: token,
  });
}
