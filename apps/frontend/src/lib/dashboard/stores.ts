import "server-only";
import { ApiError, apiRequest } from "@/lib/api";
import type { Session } from "@/lib/auth";
import {
  toApiHours,
  toOption,
  toStoreDetails,
  type ApiLojaPerfil,
  type ApiLojaResumo,
} from "@/lib/mappers";
import type { DayHours, StoreDetails, StoreSummary } from "@/lib/types";

// Lojas no painel. Criar e apagar: só o admin. Editar: o admin ou o lojista da própria loja
// (a API ignora nota e avaliações quando quem edita é o lojista).

export interface StoreInput {
  name: string;
  description: string | null;
  whatsapp: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  address: string;
  cep: string | null;
  neighborhoodId: number;
  logoUrl: string | null;
  hours: (DayHours | null)[];
  // Só o admin define
  rating?: number | null;
  reviewCount?: number;
}

function toApiBody(input: StoreInput) {
  return {
    nome: input.name,
    descricao: input.description,
    whatsapp: input.whatsapp,
    telefone: input.phone,
    email: input.email,
    instagram: input.instagram,
    endereco: input.address,
    cep: input.cep,
    bairroId: input.neighborhoodId,
    logoUrl: input.logoUrl,
    horarios: toApiHours(input.hours),
    avaliacao: input.rating,
    totalAvaliacoes: input.reviewCount,
  };
}

export async function listStores(): Promise<StoreSummary[]> {
  const lojas = await apiRequest<ApiLojaResumo[]>("/lojas");
  return lojas.map((loja) => ({
    ...toOption(loja),
    neighborhood: loja.bairro.nome,
    productCount: loja._count.produtos,
  }));
}

// null se não existir ou se for de outra loja (para o lojista)
export async function getStore({ user }: Session, id: number): Promise<StoreDetails | null> {
  if (user.role === "LOJISTA" && user.store?.id !== id) return null;
  try {
    return toStoreDetails(await apiRequest<ApiLojaPerfil>(`/lojas/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createStore({ token }: Session, input: StoreInput) {
  return apiRequest<{ id: number }>("/lojas", {
    method: "POST",
    body: toApiBody(input),
    accessToken: token,
  });
}

export function updateStore({ token }: Session, id: number, input: StoreInput) {
  return apiRequest(`/lojas/${id}`, {
    method: "PATCH",
    body: toApiBody(input),
    accessToken: token,
  });
}

// Apaga a loja e, junto, os produtos, as reservas e os lojistas dela
export function deleteStore({ token }: Session, id: number) {
  return apiRequest(`/lojas/${id}`, { method: "DELETE", accessToken: token });
}
