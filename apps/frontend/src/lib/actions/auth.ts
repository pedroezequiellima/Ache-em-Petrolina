"use server";

import { redirect } from "next/navigation";
import {
  authenticate,
  changePassword,
  requestPasswordReset,
  requireSession,
  resetPassword,
} from "@/lib/auth";
import { deleteSession } from "@/lib/session";

// Server Actions do login e da recuperação de senha. Elas rodam no servidor do Next e são
// chamadas pelos formulários: a senha vai do navegador para cá e daqui para a API, e nunca é
// guardada nem registrada.

export interface LoginState {
  error?: string;
  // Devolvido para o campo não ficar vazio depois de um erro (a senha nunca volta)
  email?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8; // mesmas regras da API
const MAX_PASSWORD = 72; // limite do bcrypt
// O código do link é base64url (gerado pela API com randomBytes)
const RESET_TOKEN = /^[A-Za-z0-9_-]{1,100}$/;

const TOO_MANY = "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
const UNAVAILABLE = "Não foi possível concluir agora. Tente de novo em alguns instantes.";
const INVALID_LINK = "Este link é inválido, expirou ou já foi usado. Peça um link novo.";

const MESSAGES = {
  invalid: "E-mail ou senha incorretos.",
  "rate-limited": TOO_MANY,
  error: UNAVAILABLE,
};

function readEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = readEmail(formData);
  const password = String(formData.get("senha") ?? "");

  if (!email || !password) return { error: "Preencha o e-mail e a senha.", email };
  // E-mail malformado ou senha maior que o permitido não têm como estar certos
  if (!EMAIL.test(email) || password.length > MAX_PASSWORD) {
    return { error: MESSAGES.invalid, email };
  }

  const result = await authenticate(email, password);
  if (!result.ok) return { error: MESSAGES[result.reason], email };

  // Destino fixo: não aceitamos "?voltar=" na URL, para o login não virar um redirecionamento
  // para sites de terceiros (open redirect)
  redirect("/painel");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/entrar");
}

export interface ForgotPasswordState {
  error?: string;
  email?: string;
  sent?: boolean;
}

export async function forgotPasswordAction(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = readEmail(formData);
  if (!EMAIL.test(email)) return { error: "Digite um e-mail válido.", email };

  const result = await requestPasswordReset(email);
  if (!result.ok) {
    return { error: result.reason === "rate-limited" ? TOO_MANY : UNAVAILABLE, email };
  }
  // Mesma resposta exista ou não a conta (a tela não revela quem está cadastrado)
  return { sent: true, email };
}

export interface ResetPasswordState {
  error?: string;
  // O link não serve mais: a tela mostra o caminho para pedir outro
  invalidLink?: boolean;
  done?: boolean;
}

export async function resetPasswordAction(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("senha") ?? "");
  const confirmation = String(formData.get("confirmacao") ?? "");

  if (!RESET_TOKEN.test(token)) return { error: INVALID_LINK, invalidLink: true };
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return { error: `A senha precisa ter de ${MIN_PASSWORD} a ${MAX_PASSWORD} caracteres.` };
  }
  if (password !== confirmation) return { error: "As duas senhas não são iguais." };

  const result = await resetPassword(token, password);
  if (result.ok) return { done: true };
  if (result.reason === "invalid") return { error: INVALID_LINK, invalidLink: true };
  return { error: result.reason === "rate-limited" ? TOO_MANY : UNAVAILABLE };
}

export interface ChangePasswordState {
  error?: string;
  done?: boolean;
}

export async function changePasswordAction(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await requireSession();
  const current = String(formData.get("senhaAtual") ?? "");
  const password = String(formData.get("senha") ?? "");
  const confirmation = String(formData.get("confirmacao") ?? "");

  if (!current) return { error: "Digite a senha atual." };
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return { error: `A senha nova precisa ter de ${MIN_PASSWORD} a ${MAX_PASSWORD} caracteres.` };
  }
  if (password !== confirmation) return { error: "As duas senhas novas não são iguais." };
  if (password === current) return { error: "A senha nova precisa ser diferente da atual." };

  const result = await changePassword(session, current, password);
  if (result.ok) return { done: true };
  if (result.reason === "invalid") return { error: "A senha atual está incorreta." };
  return { error: result.reason === "rate-limited" ? TOO_MANY : UNAVAILABLE };
}
