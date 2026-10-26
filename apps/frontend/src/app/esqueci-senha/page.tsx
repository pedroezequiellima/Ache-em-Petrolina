import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthPage } from "@/components/auth-page";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      icon={KeyRound}
      title="Esqueci minha senha"
      description="Digite o e-mail da sua conta e enviaremos um link para criar uma senha nova."
      footer={
        <Link href="/entrar" className="font-medium text-brand-700 hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
