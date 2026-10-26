"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { isReservationStatus, updateReservationStatus } from "@/lib/dashboard/reservations";
import { errorNotice, id, text } from "@/lib/form";
import { withNotice, type NoticeKey } from "@/lib/notices";

// Confirmar, marcar como retirada ou cancelar uma reserva. A API confere se a reserva é da loja
// de quem está logado e se a mudança de status é permitida.
export async function updateReservationStatusAction(formData: FormData) {
  const session = await requireSession();
  const reservationId = id(formData, "id");
  const status = text(formData, "status");
  let notice: NoticeKey = "reserva";

  if (!reservationId || !isReservationStatus(status)) {
    notice = "invalido";
  } else {
    try {
      await updateReservationStatus(session, reservationId, status);
    } catch (error) {
      notice = errorNotice(error);
    }
  }

  // Volta para a mesma aba (filtro de status) e loja que estavam abertas
  const filter = text(formData, "filtroStatus");
  redirect(
    withNotice("/painel/reservas", notice, {
      status: isReservationStatus(filter) ? filter : undefined,
      loja: id(formData, "filtroLoja") ?? undefined,
    }),
  );
}
