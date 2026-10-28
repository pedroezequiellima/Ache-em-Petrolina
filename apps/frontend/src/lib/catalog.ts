import { cacheLife, cacheTag } from "next/cache";
import { ApiError, apiGet, queryString } from "@/lib/api";
import {
  toCategory,
  toListing,
  toNeighborhood,
  toStoreProfile,
  type ApiBairro,
  type ApiCategoria,
  type ApiLojaPerfil,
  type ApiProduto,
} from "@/lib/mappers";
import type {
  Category,
  Neighborhood,
  ProductListing,
  SearchFilters,
  StoreProfile,
} from "@/lib/types";

// Funções que as páginas públicas usam para ler o catálogo. Os dados vêm da API (apps/backend):
// a busca, os filtros e a ordenação são feitos lá (src/produtos/busca.ts).
// Estoque e preço mudam ao longo do dia: cache de minutos. Categorias e bairros: de horas.
// Tudo leva a tag CATALOG_TAG: quando o painel muda algo, ele chama updateTag(CATALOG_TAG) e o
// site mostra a mudança na hora, sem esperar o cache vencer.

export const CATALOG_TAG = "catalogo";

async function getProducts(params: Record<string, string | number | undefined>) {
  const produtos = await apiGet<ApiProduto[]>(`/produtos${queryString(params)}`);
  return produtos.map(toListing);
}

export async function searchProducts(filters: SearchFilters): Promise<ProductListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  return getProducts({
    q: filters.q,
    categoria: filters.categoria,
    bairro: filters.bairro,
    comEstoque: filters.estoque ? 1 : undefined,
    ordem: filters.ordem,
  });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  return getProducts({ destaque: "true", comEstoque: 1, limite: limit });
}

export async function getProductBySlug(slug: string): Promise<ProductListing | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  try {
    const produto = await apiGet<ApiProduto>(`/produtos/slug/${encodeURIComponent(slug)}`);
    return toListing(produto);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  try {
    const products = await getProducts({});
    return products.map((p) => p.slug);
  } catch(err) {
    console.warn("[catalog] getProductsSlugs: API indisponível durante o build. Retornando []");
    return [];
  }
}

export async function getStoreProducts(
  storeId: string,
  excludeSlug: string,
  limit = 4,
): Promise<ProductListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  return getProducts({ lojaId: storeId, exceto: excludeSlug, limite: limit });
}

// Página pública da loja: dados, horários e todos os produtos
export async function getStoreBySlug(slug: string): Promise<StoreProfile | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  try {
    const loja = await apiGet<ApiLojaPerfil>(`/lojas/slug/${encodeURIComponent(slug)}`);
    return toStoreProfile(loja);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getStoreSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  try {
    const lojas = await apiGet<{ slug: string }[]>("/lojas");
    return lojas.map((l) => l.slug);
  } catch(err) {
    console.warn("[catalog] getProductsSlugs: API indisponível durante o build. Retornando []");
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const categorias = await apiGet<ApiCategoria[]>("/categorias");
  return categorias.map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const bairros = await apiGet<ApiBairro[]>("/bairros");
  return bairros.map(toNeighborhood);
}

export async function getNeighborhood(slug: string): Promise<Neighborhood | undefined> {
  const neighborhoods = await getNeighborhoods();
  return neighborhoods.find((n) => n.slug === slug);
}

export async function getNeighborhoodsWithStores(): Promise<
  (Neighborhood & { storeCount: number })[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const bairros = await apiGet<ApiBairro[]>("/bairros?comLojas=true");
  return bairros.map((b) => ({ ...toNeighborhood(b), storeCount: b._count?.lojas ?? 0 }));
}
