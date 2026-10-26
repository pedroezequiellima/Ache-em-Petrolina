import "server-only";
import { apiRequest } from "@/lib/api";
import type { Session } from "@/lib/auth";
import { toOption, type ApiBairro, type ApiCategoria } from "@/lib/mappers";
import type { Option, TaxonomyItem } from "@/lib/types";

// Categorias e bairros: as duas listas têm o mesmo formato (nome + slug) na API, então o painel
// trata as duas do mesmo jeito. Ler é público; criar, renomear e apagar só o admin.

export type TaxonomyKind = "categorias" | "bairros";

export async function listTaxonomy(kind: TaxonomyKind): Promise<TaxonomyItem[]> {
  if (kind === "categorias") {
    const categorias = await apiRequest<ApiCategoria[]>("/categorias");
    return categorias.map((c) => ({ ...toOption(c), usage: c._count?.produtos ?? 0 }));
  }
  const bairros = await apiRequest<ApiBairro[]>("/bairros");
  return bairros.map((b) => ({ ...toOption(b), usage: b._count?.lojas ?? 0 }));
}

// Para os <select> dos formulários
export async function listOptions(kind: TaxonomyKind): Promise<Option[]> {
  return (await listTaxonomy(kind)).map(({ id, slug, name }) => ({ id, slug, name }));
}

export function createTaxonomyItem({ token }: Session, kind: TaxonomyKind, name: string) {
  return apiRequest(`/${kind}`, { method: "POST", body: { nome: name }, accessToken: token });
}

// Renomear também atualiza o slug (o endereço usado nos filtros do site)
export function renameTaxonomyItem(
  { token }: Session,
  kind: TaxonomyKind,
  id: number,
  name: string,
) {
  return apiRequest(`/${kind}/${id}`, {
    method: "PATCH",
    body: { nome: name },
    accessToken: token,
  });
}

// A API recusa (409) se ainda houver produtos na categoria ou lojas no bairro
export function deleteTaxonomyItem({ token }: Session, kind: TaxonomyKind, id: number) {
  return apiRequest(`/${kind}/${id}`, { method: "DELETE", accessToken: token });
}
