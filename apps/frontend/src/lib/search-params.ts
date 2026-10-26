import type { SearchFilters, SortOrder } from "@/lib/types";

const SORT_ORDERS: SortOrder[] = ["relevancia", "menor-preco", "maior-preco"];

export const DEFAULT_FILTERS: SearchFilters = {
  q: "",
  categoria: "",
  bairro: "",
  estoque: false,
  ordem: "relevancia",
};

type RawSearchParams = Record<string, string | string[] | undefined>;

// Primeiro valor de um parâmetro da URL (?a=1&a=2 vira "1"), sem espaços nas pontas
export function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseSearchParams(raw: RawSearchParams): SearchFilters {
  const ordem = first(raw.ordem) as SortOrder;
  return {
    q: first(raw.q).slice(0, 100),
    categoria: first(raw.categoria),
    bairro: first(raw.bairro),
    estoque: first(raw.estoque) === "1",
    ordem: SORT_ORDERS.includes(ordem) ? ordem : "relevancia",
  };
}

export function buildSearchHref(filters: Partial<SearchFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.bairro) params.set("bairro", filters.bairro);
  if (filters.estoque) params.set("estoque", "1");
  if (filters.ordem && filters.ordem !== "relevancia") params.set("ordem", filters.ordem);
  const query = params.toString();
  return query ? `/busca?${query}` : "/busca";
}
