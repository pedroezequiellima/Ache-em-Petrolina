import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { toUserSummary, type ApiUsuario } from "@/lib/mappers";
import { getSessionToken, saveSession } from "@/lib/session";
import type { Role, UserSummary } from "@/lib/types";

// Login, recuperação de senha e usuário logado. Toda conferência de senha e de token é feita
// pela API (apps/backend/src/auth); aqui só chamamos as rotas e guardamos a sessão.

export type CurrentUser = UserSummary;

export interface Session {
  user: CurrentUser;
  // Token de login, para chamar as rotas protegidas da API. Nunca vai para o navegador
  token: string;
}

export type AuthResult = { ok: true } | { ok: false; reason: "invalid" | "rate-limited" | "error" };

export async function authenticate(email: string, password: string): Promise<AuthResult> {
  try {
    const { accessToken } = await apiRequest<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: { email, senha: password },
      clientIp: await clientIp(),
    });
    await saveSession(accessToken);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      return { ok: false, reason: "invalid" };
    }
    return failure(error);
  }
}

// "Esqueci minha senha": a API manda o link por e-mail se a conta existir. A resposta é a mesma
// nos dois casos, para não revelar quem tem conta.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await apiRequest("/auth/esqueci-senha", {
      method: "POST",
      body: { email },
      clientIp: await clientIp(),
    });
    return { ok: true };
  } catch (error) {
    // 400: e-mail malformado. Respondemos como se tivesse dado certo, igual à API
    if (error instanceof ApiError && error.status === 400) return { ok: true };
    return failure(error);
  }
}

// Troca a senha com o código do link. "invalid": link inválido, expirado ou já usado
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    await apiRequest("/auth/redefinir-senha", {
      method: "POST",
      body: { token, novaSenha: newPassword },
      clientIp: await clientIp(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) return { ok: false, reason: "invalid" };
    return failure(error);
  }
}

// Troca a senha de quem está logado. "invalid": a senha atual está errada
export async function changePassword(
  { token }: Session,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    await apiRequest("/auth/senha", {
      method: "PATCH",
      body: { senhaAtual: currentPassword, novaSenha: newPassword },
      accessToken: token,
      clientIp: await clientIp(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      return { ok: false, reason: "invalid" };
    }
    return failure(error);
  }
}

function failure(error: unknown): AuthResult {
  if (error instanceof ApiError && error.status === 429) {
    return { ok: false, reason: "rate-limited" };
  }
  // Só o status e a rota vão para o log (nunca o corpo, que tem senha ou código)
  console.error(error);
  return { ok: false, reason: "error" };
}

// Sessão atual, ou null se não houver login ou se a API recusar o token (expirado, inválido ou
// usuário apagado). Sem o cache() do React de propósito: com Cache Components, a promessa de
// cookies() reaproveitada entre a renderização e a validação do Next quebra a página
// ("Received an underlying cookies object that does not match"). O menu e a página fazem uma
// chamada cada a /auth/me, que é leve.
export async function getSession(): Promise<Session | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const usuario = await apiRequest<ApiUsuario>("/auth/me", { accessToken: token });
    return { user: toUserSummary(usuario), token };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) return null;
    throw error;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await getSession())?.user ?? null;
}

// Para as páginas e actions do painel: sem login, vai para /entrar. Com `role`, quem tiver outro
// papel recebe "não encontrado" (o lojista nem fica sabendo que a página de admin existe).
// Isto organiza as telas; quem garante a permissão de verdade é a API, em toda chamada.
export async function requireSession(role?: Role): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/entrar");
  if (role && session.user.role !== role) notFound();
  return session;
}

// IP do visitante, para a API limitar as tentativas (login, reserva) por pessoa e não pelo IP
// deste servidor. Usa o último endereço do X-Forwarded-For, que é o que o proxy mais próximo (ou
// o próprio Next, sem proxy) anotou. Em produção, o Nginx deve SOBRESCREVER esse cabeçalho com o
// IP real (proxy_set_header X-Forwarded-For $remote_addr), senão o visitante pode inventá-lo.
export async function clientIp(): Promise<string | undefined> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",").at(-1)?.trim() || undefined;
}
