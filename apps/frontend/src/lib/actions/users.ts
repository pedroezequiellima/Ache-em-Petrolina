"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createUser, deleteUser } from "@/lib/dashboard/users";
import { apiErrorMessage, errorNotice, failedState, id, text, type FormState } from "@/lib/form";
import { withNotice, type NoticeKey } from "@/lib/notices";

// Contas de acesso: só o admin cria e remove.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUserAction(
  previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession("ADMIN");
  const fail = (error: string) => failedState(previous, formData, error);

  const name = text(formData, "nome");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("senha") ?? "");
  const role = text(formData, "papel") === "ADMIN" ? "ADMIN" : "LOJISTA";
  const storeId = id(formData, "lojaId");

  if (!name) return fail("Digite o nome.");
  if (!EMAIL.test(email)) return fail("Digite um e-mail válido.");
  if (password.length < 8 || password.length > 72) {
    return fail("A senha precisa ter de 8 a 72 caracteres.");
  }
  if (role === "LOJISTA" && !storeId) return fail("Escolha a loja do lojista.");

  try {
    await createUser(session, { name, email, password, role, storeId });
  } catch (error) {
    // 409: já existe uma conta com este e-mail
    const message = apiErrorMessage(error);
    return fail(message.startsWith("Já existe") ? "Já existe uma conta com este e-mail." : message);
  }

  redirect(withNotice("/painel/usuarios", "criado"));
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireSession("ADMIN");
  const userId = id(formData, "id");
  let notice: NoticeKey = "removido";

  if (!userId) {
    notice = "invalido";
  } else if (userId === session.user.id) {
    // Sem isto, o admin poderia apagar a própria conta e ficar sem acesso
    notice = "proprio";
  } else {
    try {
      await deleteUser(session, userId);
    } catch (error) {
      notice = errorNotice(error);
    }
  }
  redirect(withNotice("/painel/usuarios", notice));
}
