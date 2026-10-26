// Avisos que aparecem no topo das listas do painel depois de uma ação (?aviso=salvo).
// A URL só carrega a chave; o texto vem daqui, então ninguém consegue escrever uma mensagem
// qualquer na tela mexendo no link.

export const NOTICES = {
  criado: { tone: "success", text: "Cadastro feito." },
  salvo: { tone: "success", text: "Alterações salvas." },
  removido: { tone: "success", text: "Removido." },
  reserva: { tone: "success", text: "Reserva atualizada." },
  estoque: { tone: "success", text: "Estoque atualizado." },
  "em-uso": {
    tone: "error",
    text: "Não dá para remover: ainda há cadastros ligados a este (produtos, lojas ou usuários).",
  },
  duplicado: { tone: "error", text: "Já existe um cadastro com esse nome." },
  invalido: {
    tone: "error",
    text: "Confira o que foi digitado: algum campo ficou vazio ou longo demais.",
  },
  "nao-encontrado": { tone: "error", text: "Este cadastro não existe mais." },
  proprio: { tone: "error", text: "Você não pode remover a sua própria conta." },
  "sem-permissao": { tone: "error", text: "Você não tem permissão para fazer isso." },
  falhou: { tone: "error", text: "Não foi possível concluir. Tente de novo em alguns instantes." },
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function isNoticeKey(value: unknown): value is NoticeKey {
  // hasOwn, não "in": com "in", ?aviso=toString passaria (herdado de Object)
  return typeof value === "string" && Object.hasOwn(NOTICES, value);
}

// Endereço de volta para a lista, com o aviso e os filtros que já estavam na tela
export function withNotice(
  path: string,
  notice: NoticeKey,
  params: Record<string, string | number | undefined> = {},
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  query.set("aviso", notice);
  return `${path}?${query}`;
}
