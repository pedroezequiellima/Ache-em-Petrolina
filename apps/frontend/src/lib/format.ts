import type { DayHours, ProductListing, Reservation, Store } from "@/lib/types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatPrice(value: number): string {
  return brl.format(value);
}

export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function fullAddress(store: Store & { neighborhood: { name: string } }): string {
  return `${store.address} - ${store.neighborhood.name}, Petrolina - PE, ${store.cep}`;
}

export function whatsappLink(product: ProductListing): string {
  const question =
    product.stock === "esgotado" ? "Vocês vão receber mais unidades?" : "Ainda está disponível?";
  const text =
    `Olá, ${product.store.name}! Vi o produto "${product.name}" ` +
    `por ${formatPrice(product.price)} no Ache em Petrolina. ${question}`;
  return `https://wa.me/${product.store.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function storeWhatsappLink(store: Pick<Store, "name" | "whatsapp">): string {
  const text = `Olá, ${store.name}! Vi a loja de vocês no Ache em Petrolina.`;
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Depois de reservar: o cliente avisa a loja, já com o número da reserva
export function reservationWhatsappLink(reservation: Reservation): string {
  const { product } = reservation;
  const text =
    `Olá, ${product.store.name}! Sou ${reservation.customerName} e fiz a reserva nº ${reservation.id} ` +
    `no Ache em Petrolina: ${reservation.quantity}x "${product.name}". Podem confirmar?`;
  return `https://wa.me/${product.store.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Do painel para o cliente da reserva
export function customerWhatsappLink(reservation: Reservation, message: string): string {
  return `https://wa.me/${reservation.customerWhatsapp}?text=${encodeURIComponent(message)}`;
}

// "5587988887777" vira "(87) 98888-7777"
export function formatWhatsapp(digits: string): string {
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  const match = /^(\d{2})(\d{4,5})(\d{4})$/.exec(local);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : digits;
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Recife",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// "27/10, 14:30" no horário de Petrolina
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function phoneLink(phone: string): string {
  return `tel:+55${phone.replace(/\D/g, "")}`;
}

export function directionsLink(store: Store & { neighborhood: { name: string } }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress(store))}`;
}

export const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatHour(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function sameHours(a: DayHours | null, b: DayHours | null): boolean {
  return a?.open === b?.open && a?.close === b?.close;
}

export function groupOpeningHours(hours: (DayHours | null)[]): { days: string; hours: string }[] {
  const groups: { start: number; end: number; value: DayHours | null }[] = [];

  for (const day of WEEK_ORDER) {
    const last = groups.at(-1);
    if (last && sameHours(last.value, hours[day])) {
      last.end = day;
    } else {
      groups.push({ start: day, end: day, value: hours[day] });
    }
  }

  return groups.map(({ start, end, value }) => ({
    days: start === end ? DAY_LABELS[start] : `${DAY_LABELS[start]} a ${DAY_LABELS[end]}`,
    hours: value ? `${formatHour(value.open)} às ${formatHour(value.close)}` : "Fechado",
  }));
}

// Foto com link de outro site (https://...), cadastrada pelo lojista. Vai como unoptimized no
// <Image>: o navegador carrega direto, sem precisar liberar cada domínio no next.config.ts
// (liberar todos faria o otimizador do Next servir de proxy para qualquer site)
export function isExternalImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}
