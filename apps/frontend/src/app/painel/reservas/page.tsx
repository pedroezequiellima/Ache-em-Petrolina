import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import {
  dangerButton,
  EmptyState,
  NoticeBanner,
  PageHeader,
  RESERVATION_LABELS,
  ReservationBadge,
  smallButton,
} from "@/components/dashboard/ui";
import { updateReservationStatusAction } from "@/lib/actions/reservations";
import { requireSession } from "@/lib/auth";
import {
  isReservationStatus,
  listReservations,
  NEXT_STATUSES,
  RESERVATION_STATUSES,
} from "@/lib/dashboard/reservations";
import { listStores } from "@/lib/dashboard/stores";
import { customerWhatsappLink, formatDateTime, formatPrice, formatWhatsapp } from "@/lib/format";
import { first } from "@/lib/search-params";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Reservas" };

// Texto do botão que leva a reserva para cada status
const ACTION_LABELS: Partial<Record<ReservationStatus, string>> = {
  CONFIRMADA: "Confirmar",
  RETIRADA: "Marcar como retirada",
  CANCELADA: "Cancelar",
};

function customerMessage(reservation: Reservation): string {
  const { product } = reservation;
  return (
    `Olá, ${reservation.customerName}! Aqui é a ${product.store.name}, sobre a sua reserva ` +
    `nº ${reservation.id} no Ache em Petrolina: ${reservation.quantity}x "${product.name}".`
  );
}

export default suspended(async function ReservationsPage({
  searchParams,
}: PageProps<"/painel/reservas">) {
  const session = await requireSession();
  const params = await searchParams;
  const isAdmin = session.user.role === "ADMIN";

  const statusParam = first(params.status);
  const status = isReservationStatus(statusParam) ? statusParam : undefined;
  const storeFilter = isAdmin ? Number(first(params.loja)) || undefined : undefined;

  const [reservations, stores] = await Promise.all([
    listReservations(session, { status, storeId: storeFilter }),
    isAdmin ? listStores() : null,
  ]);

  const tabHref = (tab?: ReservationStatus) => {
    const query = new URLSearchParams();
    if (tab) query.set("status", tab);
    if (storeFilter) query.set("loja", String(storeFilter));
    const text = query.toString();
    return text ? `/painel/reservas?${text}` : "/painel/reservas";
  };

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Confirme com o cliente pelo WhatsApp e atualize a reserva aqui."
      />
      <NoticeBanner notice={first(params.aviso)} />

      <nav aria-label="Filtrar por situação" className="mb-4">
        <ul className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
          {[undefined, ...RESERVATION_STATUSES].map((tab) => {
            const active = tab === status;
            return (
              <li key={tab ?? "todas"} className="shrink-0">
                <Link
                  href={tabHref(tab)}
                  aria-current={active ? "true" : undefined}
                  className={`block rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  {tab ? RESERVATION_LABELS[tab] : "Todas"}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {stores && (
        <form className="mb-4 flex flex-wrap items-end gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="text-sm font-medium text-stone-800">
            Loja
            <select
              name="loja"
              defaultValue={storeFilter ?? ""}
              className="mt-1 block h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm"
            >
              <option value="">Todas as lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={smallButton}>
            Filtrar
          </button>
        </form>
      )}

      {reservations.length === 0 ? (
        <EmptyState>Nenhuma reserva {status ? "nesta situação" : "ainda"}.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reservations.map((reservation) => (
            <li key={reservation.id} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-stone-500">
                    Reserva nº {reservation.id} · {formatDateTime(reservation.createdAt)}
                  </p>
                  <p className="font-semibold text-stone-900">
                    {reservation.quantity}x {reservation.product.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatPrice(reservation.product.price * reservation.quantity)}
                    {isAdmin && <> · {reservation.product.store.name}</>}
                  </p>
                </div>
                <ReservationBadge status={reservation.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <div className="text-sm">
                  <p className="font-medium text-stone-900">{reservation.customerName}</p>
                  <p className="text-stone-600">
                    {formatWhatsapp(reservation.customerWhatsapp)}
                    {(reservation.status === "NOVA" || reservation.status === "CONFIRMADA") && (
                      <> · retirar até {formatDateTime(reservation.expiresAt)}</>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={customerWhatsappLink(reservation, customerMessage(reservation))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={smallButton}
                  >
                    <MessageCircle className="size-4 text-emerald-700" aria-hidden />
                    WhatsApp
                  </a>
                  {NEXT_STATUSES[reservation.status].map((next) => (
                    <form key={next} action={updateReservationStatusAction}>
                      <input type="hidden" name="id" value={reservation.id} />
                      <input type="hidden" name="status" value={next} />
                      <input type="hidden" name="filtroStatus" value={status ?? ""} />
                      <input type="hidden" name="filtroLoja" value={storeFilter ?? ""} />
                      {next === "CANCELADA" ? (
                        <ConfirmSubmit
                          message={`Cancelar a reserva nº ${reservation.id}?`}
                          className={dangerButton}
                        >
                          {ACTION_LABELS[next]}
                        </ConfirmSubmit>
                      ) : (
                        <button type="submit" className={smallButton}>
                          {ACTION_LABELS[next]}
                        </button>
                      )}
                    </form>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
});
