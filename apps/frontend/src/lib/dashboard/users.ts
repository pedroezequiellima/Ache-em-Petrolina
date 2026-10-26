import "server-only";
import { apiRequest } from "@/lib/api";
import type { Session } from "@/lib/auth";
import { toUserSummary, type ApiUsuario } from "@/lib/mappers";
import type { Role } from "@/lib/types";

// Contas de acesso (só o admin). A senha vai direto para a API, que guarda só o hash.

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  // Obrigatória para LOJISTA; vazia para ADMIN
  storeId: number | null;
}

export async function listUsers({ token }: Session) {
  const usuarios = await apiRequest<ApiUsuario[]>("/usuarios", { accessToken: token });
  return usuarios.map(toUserSummary);
}

export function createUser({ token }: Session, input: UserInput) {
  return apiRequest("/usuarios", {
    method: "POST",
    body: {
      nome: input.name,
      email: input.email,
      senha: input.password,
      papel: input.role,
      lojaId: input.role === "LOJISTA" ? input.storeId : undefined,
    },
    accessToken: token,
  });
}

export function deleteUser({ token }: Session, id: number) {
  return apiRequest(`/usuarios/${id}`, { method: "DELETE", accessToken: token });
}
