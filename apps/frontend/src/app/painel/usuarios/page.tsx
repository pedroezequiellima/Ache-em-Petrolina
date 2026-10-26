import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { dangerButton, NoticeBanner, PageHeader } from "@/components/dashboard/ui";
import { UserForm } from "@/components/dashboard/user-form";
import { FormSection } from "@/components/form-fields";
import { deleteUserAction } from "@/lib/actions/users";
import { requireSession } from "@/lib/auth";
import { listStores } from "@/lib/dashboard/stores";
import { listUsers } from "@/lib/dashboard/users";
import { first } from "@/lib/search-params";
import { suspended } from "@/components/dashboard/suspended";

export const metadata: Metadata = { title: "Usuários" };

export default suspended(async function UsersPage({ searchParams }: PageProps<"/painel/usuarios">) {
  const session = await requireSession("ADMIN");
  const [users, stores, params] = await Promise.all([
    listUsers(session),
    listStores(),
    searchParams,
  ]);

  return (
    <>
      <PageHeader title="Usuários" description="Quem pode entrar no painel." />
      <NoticeBanner notice={first(params.aviso)} />

      <ul className="mb-6 divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
        {users.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-stone-900">
                {user.name}
                {user.id === session.user.id && (
                  <span className="ml-2 text-sm font-normal text-stone-500">(você)</span>
                )}
              </p>
              <p className="truncate text-sm text-stone-600">
                {user.email} · {user.role === "ADMIN" ? "Administrador" : user.store?.name}
              </p>
            </div>
            {user.id !== session.user.id && (
              <form action={deleteUserAction}>
                <input type="hidden" name="id" value={user.id} />
                <ConfirmSubmit
                  message={`Remover o acesso de ${user.name}?`}
                  className={dangerButton}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Remover
                </ConfirmSubmit>
              </form>
            )}
          </li>
        ))}
      </ul>

      <FormSection title="Novo acesso">
        <UserForm stores={stores} />
      </FormSection>
    </>
  );
});
