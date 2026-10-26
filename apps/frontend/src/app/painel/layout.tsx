import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/nav";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel | Ache em Petrolina" },
  robots: { index: false },
};

// Área logada. A sessão é lida a cada visita (cookie), então o menu chega dentro de <Suspense> e
// cada página tem o seu (veja components/dashboard/suspended.tsx). Cada página chama
// requireSession(), que manda para /entrar quem não está logado.
export default function DashboardLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
      <Suspense fallback={<div className="mb-6 h-10 animate-pulse rounded-xl bg-stone-200" />}>
        <NavForCurrentUser />
      </Suspense>
      <main className="min-w-0">{children}</main>
    </div>
  );
}

async function NavForCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return <DashboardNav role={session.user.role} name={session.user.name} />;
}
