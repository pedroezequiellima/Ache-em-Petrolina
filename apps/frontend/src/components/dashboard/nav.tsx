"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Store,
  Tags,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  // Sem `roles`: aparece para todos
  roles?: Role[];
}

const LINKS: NavLink[] = [
  { href: "/painel", label: "Início", icon: LayoutDashboard },
  { href: "/painel/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/painel/produtos", label: "Produtos", icon: Package },
  { href: "/painel/loja", label: "Minha loja", icon: Store, roles: ["LOJISTA"] },
  { href: "/painel/lojas", label: "Lojas", icon: Store, roles: ["ADMIN"] },
  { href: "/painel/usuarios", label: "Usuários", icon: Users, roles: ["ADMIN"] },
  { href: "/painel/categorias", label: "Categorias", icon: Tags, roles: ["ADMIN"] },
  { href: "/painel/bairros", label: "Bairros", icon: MapPin, roles: ["ADMIN"] },
  { href: "/painel/conta", label: "Minha conta", icon: UserCog },
];

// Menu do painel: barra rolável no celular, coluna lateral no computador.
// Esconder um link não protege nada: cada página e a API conferem o papel de novo.
export function DashboardNav({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const links = LINKS.filter((link) => !link.roles || link.roles.includes(role));

  const isActive = (href: string) =>
    href === "/painel" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Painel" className="mb-6 lg:mb-0">
      <p className="mb-2 hidden truncate text-sm text-stone-500 lg:block">{name}</p>
      <ul className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400 lg:border-transparent lg:bg-transparent lg:hover:bg-white"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 lg:border-transparent lg:bg-transparent lg:hover:bg-white"
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
