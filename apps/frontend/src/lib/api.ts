import "server-only";

// Cliente HTTP da API (apps/backend). Só o servidor do Next chama a API: o navegador nunca
// recebe o endereço dela, o FRONTEND_TOKEN nem o token de login. A conversão dos dados
// (português → inglês) fica em mappers.ts.

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const TIMEOUT_MS = 5000;

// Todas as visitas chegam na API pelo IP deste servidor: com o token, as leituras do site não
// entram no limite de requisições por IP da API (veja FRONTEND_TOKEN no README).
const FRONTEND_TOKEN = process.env.FRONTEND_TOKEN;

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    method: Method,
    path: string,
    // Mensagem que a API devolveu (ex: "slug deve ter só letras minúsculas..."). Pode ser
    // mostrada a quem está logado; nunca contém senha nem token
    readonly apiMessage: string,
  ) {
    // O texto do erro (que vai para os logs) tem só o status e a rota
    super(`A API respondeu ${status} em ${method} ${path}`);
  }
}

interface ApiRequestOptions {
  method?: Method;
  body?: unknown;
  // Token de login do usuário (rotas protegidas da API)
  accessToken?: string;
  // IP do visitante: com o FRONTEND_TOKEN, a API usa este IP nos limites por pessoa (ex: login)
  clientIp?: string;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, accessToken, clientIp }: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (FRONTEND_TOKEN) headers["x-frontend-token"] = FRONTEND_TOKEN;
  if (clientIp) headers["x-cliente-ip"] = clientIp;
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["content-type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new ApiError(response.status, method, path, await readMessage(response));
  }
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

// Monta "?a=1&b=2" ignorando os valores vazios
export function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

// O Nest responde { message: "..." } ou, nos erros de validação, { message: ["...", "..."] }
async function readMessage(response: Response): Promise<string> {
  try {
    const { message } = (await response.json()) as { message?: string | string[] };
    return Array.isArray(message) ? message.join(". ") : (message ?? "");
  } catch {
    return "";
  }
}
