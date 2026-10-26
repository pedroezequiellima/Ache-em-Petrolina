import "server-only";
import { ApiError } from "@/lib/api";
import type { NoticeKey } from "@/lib/notices";

// Ajudantes das Server Actions: ler os campos do FormData e transformar erros da API em
// mensagens para a tela.

// Estado devolvido pelos formulários do painel (useActionState)
export interface FormState {
  error?: string;
  // O que a pessoa digitou, para o formulário não voltar vazio depois de um erro
  values?: Record<string, string>;
  // Muda a cada envio: o formulário usa como `key` para recarregar com os valores acima
  attempt?: number;
}

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Campo opcional: vazio vira null (assim a edição também consegue apagar o valor)
export function optionalText(formData: FormData, name: string): string | null {
  return text(formData, name) || null;
}

// Uma linha por item (detalhes, fotos)
export function lines(formData: FormData, name: string): string[] {
  return text(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Itens separados por vírgula (tags)
export function commaList(formData: FormData, name: string): string[] {
  return text(formData, name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

// Inteiro positivo (ids que chegam de <select> e campos escondidos)
export function id(formData: FormData, name: string): number | null {
  const value = Number(text(formData, name));
  return Number.isInteger(value) && value > 0 ? value : null;
}

// Aceita "1.299,90", "1299,90" e "1299.90". Vazio vira null
export function money(formData: FormData, name: string): number | null {
  const raw = text(formData, name).replace(/\s|R\$/g, "");
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN;
}

// Tudo o que é texto no formulário, menos os campos internos do Next e as senhas
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value !== "string" || key.startsWith("$") || /senha/i.test(key)) continue;
    values[key] = value;
  }
  return values;
}

export function failedState(previous: FormState, formData: FormData, error: string): FormState {
  return { error, values: formValues(formData), attempt: (previous.attempt ?? 0) + 1 };
}

// Mensagem para quem está logado. Os erros 400/409 da API já vêm em português e explicam o
// problema (ex: "slug deve ter só letras minúsculas..."); os outros viram um texto genérico
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if ((error.status === 400 || error.status === 409) && error.apiMessage) {
      return withPeriod(capitalize(error.apiMessage));
    }
    if (error.status === 403) return "Você não tem permissão para fazer isso.";
    if (error.status === 404) return "Este cadastro não existe mais.";
    if (error.status === 429) return "Muitas tentativas seguidas. Espere um minuto.";
  }
  console.error(error);
  return "Não foi possível salvar agora. Tente de novo em alguns instantes.";
}

function capitalize(message: string): string {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

function withPeriod(message: string): string {
  return /[.!?]$/.test(message) ? message : `${message}.`;
}

// Aviso para as ações rápidas das listas (apagar, mudar estoque, mudar status).
// `conflict`: o que um 409 da API significa nesta ação (apagar = "em uso"; criar = "duplicado")
export function errorNotice(error: unknown, conflict: NoticeKey = "em-uso"): NoticeKey {
  if (error instanceof ApiError) {
    if (error.status === 409) return conflict;
    if (error.status === 403) return "sem-permissao";
    if (error.status === 404) return "nao-encontrado";
    if (error.status === 400) return "invalido";
  }
  console.error(error);
  return "falhou";
}

// WhatsApp só com números e com o 55 do Brasil: "(87) 98888-7777" vira "5587988887777"
export function whatsappDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}
