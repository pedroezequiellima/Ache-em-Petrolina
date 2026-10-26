import type { Metadata } from "next";
import { Store } from "lucide-react";
import { AuthPage } from "@/components/auth-page";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso dos lojistas e administradores do Ache em Petrolina.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthPage
      icon={Store}
      title="Área do lojista"
      description="Entre com a conta da sua loja."
      footer="Ainda não tem conta? As contas das lojas são criadas pela equipe do Ache em Petrolina."
    >
      <LoginForm />
    </AuthPage>
  );
}
