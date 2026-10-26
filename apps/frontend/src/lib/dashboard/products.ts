import "server-only";
import { ApiError, apiRequest, queryString } from "@/lib/api";
import type { Session } from "@/lib/auth";
import { API_STOCK, toManagedProduct, type ApiProduto } from "@/lib/mappers";
import type { ManagedProduct, StockLevel } from "@/lib/types";

// Produtos no painel. Sem cache: quem edita precisa ver o dado atual. O lojista só enxerga a
// própria loja; a API confere de novo em cada alteração (403 se a loja não for dele).

export interface ProductInput {
  name: string;
  brand: string | null;
  description: string | null;
  details: string[];
  price: number;
  oldPrice: number | null;
  images: string[];
  tags: string[];
  featured: boolean;
  stock: StockLevel;
  storeId: number;
  categoryId: number;
}

function toApiBody(input: ProductInput) {
  return {
    nome: input.name,
    marca: input.brand,
    descricao: input.description,
    detalhes: input.details,
    preco: input.price,
    precoAntigo: input.oldPrice,
    fotos: input.images,
    tags: input.tags,
    destaque: input.featured,
    statusEstoque: API_STOCK[input.stock],
    lojaId: input.storeId,
    categoriaId: input.categoryId,
  };
}

// O lojista vê só a loja dele; o admin escolhe a loja (ou todas)
export function storeScope({ user }: Session, storeId?: number): number | undefined {
  return user.role === "LOJISTA" ? user.store?.id : storeId;
}

export async function listProducts(session: Session, storeId?: number) {
  const lojaId = storeScope(session, storeId);
  const produtos = await apiRequest<ApiProduto[]>(`/produtos${queryString({ lojaId })}`);
  return produtos.map(toManagedProduct).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

// null se não existir ou se for de outra loja (para o lojista)
export async function getProduct(session: Session, id: number): Promise<ManagedProduct | null> {
  try {
    const product = toManagedProduct(await apiRequest<ApiProduto>(`/produtos/${id}`));
    const scope = storeScope(session);
    return scope === undefined || Number(product.storeId) === scope ? product : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createProduct({ token }: Session, input: ProductInput) {
  return apiRequest("/produtos", { method: "POST", body: toApiBody(input), accessToken: token });
}

export function updateProduct({ token }: Session, id: number, input: ProductInput) {
  return apiRequest(`/produtos/${id}`, {
    method: "PATCH",
    body: toApiBody(input),
    accessToken: token,
  });
}

export function updateStock({ token }: Session, id: number, stock: StockLevel) {
  return apiRequest(`/produtos/${id}/estoque`, {
    method: "PATCH",
    body: { statusEstoque: API_STOCK[stock] },
    accessToken: token,
  });
}

export function deleteProduct({ token }: Session, id: number) {
  return apiRequest(`/produtos/${id}`, { method: "DELETE", accessToken: token });
}
