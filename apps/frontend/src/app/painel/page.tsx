import Link from "next/link";
import { CalendarCheck, Package, Store, Users, type LucideIcon } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { listProducts } from "@/lib/dashboard/products";
import { listReservations } from "@/lib/dashboard/reservations";
import { listStores } from "@/lib/dashboard/stores";
import { listUsers } from "@/lib/dashboard/users";
import { suspended } from "@/components/dashboard/suspended";

export default suspended(async function DashboardHomePage() {
  const session = await requireSession();
  const { user } = session;
  const isAdmin = user.role === "ADMIN";

  const [newReservations, confirmedReservations, products] = await Promise.all([
    listReservations(session, { status: "NOVA" }),
    listReservations(session, { status: "CONFIRMADA" }),
    listProducts(session),
  ]);
  const [stores, users] = isAdmin
    ? await Promise.all([listStores(), listUsers(session)])
    : [null, null];
  const outOfStock = products.filter((p) => p.stock === "esgotado").length;

  const cards: { href: string; icon: LucideIcon; value: number; label: string; hint?: string }[] = [
    {
      href: "/painel/reservas?status=NOVA",
      icon: CalendarCheck,
      value: newReservations.length,
      label: newReservations.length === 1 ? "reserva nova" : "reservas novas",
      hint: "Confirme pelo WhatsApp do cliente",
    },
    {
      href: "/painel/reservas?status=CONFIRMADA",
      icon: CalendarCheck,
      value: confirmedReservations.length,
      label: "aguardando retirada",
    },
    {
      href: "/painel/produtos",
      icon: Package,
      value: products.length,
      label: products.length === 1 ? "produto" : "produtos",
      hint: outOfStock ? `${outOfStock} esgotado(s)` : undefined,
    },
  ];
  if (stores)
    cards.push({ href: "/painel/lojas", icon: Store, value: stores.length, label: "lojas" });
  if (users) {
    cards.push({ href: "/painel/usuarios", icon: Users, value: users.length, label: "usuários" });
  }

  return (
    <>
      <p className="text-sm font-medium text-stone-500">
        {isAdmin ? "Administrador" : user.store?.name}
      </p>
      <h1 className="text-2xl font-bold tracking-tight">Olá, {user.name}!</h1>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, icon: Icon, value, label, hint }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 hover:ring-brand-500"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-2xl font-bold text-stone-900">{value}</span>
                <span className="block text-sm text-stone-700">{label}</span>
                {hint && <span className="mt-0.5 block text-xs text-stone-500">{hint}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {!isAdmin && user.store && (
        <p className="mt-6 text-sm text-stone-600">
          Sua loja no site:{" "}
          <Link
            href={`/loja/${user.store.slug}`}
            className="font-medium text-brand-700 hover:underline"
          >
            /loja/{user.store.slug}
          </Link>
        </p>
      )}
    </>
  );
});
