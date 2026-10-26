import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { AuthPage } from "@/components/auth-page";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false },
  // O código do link está na URL: nenhum outro site recebe esta URL como "página de origem".
  // Não use "no-referrer": com ele o navegador manda "Origin: null" no envio do formulário sem
  // JavaScript, e o Next recusa a Server Action (proteção contra CSRF)
  referrer: "same-origin",
};

type RawSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function ResetPasswordPage({ searchParams }: PageProps<"/redefinir-senha">) {
  return (
    <AuthPage
      icon={KeyRound}
      title="Criar senha nova"
      description="Escolha a senha nova da sua conta."
      footer={
        <Link href="/entrar" className="font-medium text-brand-700 hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      {/* O código vem da URL (?token=), lida a cada visita: o formulário chega no Suspense */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-stone-100" />}>
        <ResetPasswordContent searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function ResetPasswordContent({ searchParams }: { searchParams: RawSearchParams }) {
  const { token } = await searchParams;

  if (typeof token !== "string" || !token) {
    return (
      <div className="text-center">
        <p className="font-semibold text-stone-900">Link incompleto</p>
        <p className="mt-1 text-sm text-stone-600">
          Abra o link exatamente como chegou no e-mail ou peça um link novo.
        </p>
        <Link
          href="/esqueci-senha"
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          Pedir um link novo
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
