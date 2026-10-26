import "server-only";
import { cookies } from "next/headers";

// Sessão do lojista/admin: o token de login (JWT) que a API devolve fica num cookie que o
// JavaScript do navegador não consegue ler (httpOnly). Só o servidor do Next usa o token, para
// chamar a API em nome do usuário.

const COOKIE = "ache_sessao";

export async function saveSession(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, accessToken, {
    httpOnly: true,
    // Só por HTTPS em produção (em desenvolvimento o site roda em http://localhost)
    secure: process.env.NODE_ENV === "production",
    // Não vai junto em requisições iniciadas por outros sites (proteção contra CSRF)
    sameSite: "lax",
    path: "/",
    // Expira junto com o token. Sem data, vale até o navegador fechar
    expires: tokenExpiration(accessToken),
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

// Lê só a validade (exp) do JWT. A assinatura não é conferida aqui: quem confere é a API, em
// toda chamada. O front não tem (nem deve ter) o JWT_SECRET.
function tokenExpiration(token: string): Date | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? new Date(payload.exp * 1000) : undefined;
  } catch {
    return undefined;
  }
}
