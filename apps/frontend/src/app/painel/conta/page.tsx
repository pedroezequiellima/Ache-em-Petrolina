import type { Metadata } from "next";
import { Mail, ShieldCheck, Store } from "lucide-react";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PageHeader } from "@/components/dashboard/ui";
import { FormSection } from "@/components/form-fields";
import { requireSession } from "@/lib/auth";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Minha conta" };

export default suspended(async function AccountPage() {
  const { user } = await requireSession();

  return (
    <>
      <PageHeader title="Minha conta" />
      <div className="space-y-4">
        <FormSection title="Dados">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-stone-400" aria-hidden />
              <dt className="sr-only">E-mail</dt>
              <dd className="text-stone-700">{user.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 shrink-0 text-stone-400" aria-hidden />
              <dt className="sr-only">Tipo de conta</dt>
              <dd className="text-stone-700">
                {user.role === "ADMIN" ? "Administrador" : "Lojista"}
              </dd>
            </div>
            {user.store && (
              <div className="flex items-center gap-3">
                <Store className="size-5 shrink-0 text-stone-400" aria-hidden />
                <dt className="sr-only">Loja</dt>
                <dd className="font-medium text-stone-900">{user.store.name}</dd>
              </div>
            )}
          </dl>
        </FormSection>
        <FormSection title="Trocar senha">
          <ChangePasswordForm />
        </FormSection>
      </div>
    </>
  );
});
