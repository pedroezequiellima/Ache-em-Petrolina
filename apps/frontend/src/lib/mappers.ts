import type {
  Category,
  DayHours,
  ManagedProduct,
  Neighborhood,
  Option,
  ProductListing,
  Reservation,
  ReservationStatus,
  Role,
  StockLevel,
  Store,
  StoreDetails,
  StoreProfile,
  UserSummary,
} from "@/lib/types";

// A API usa nomes em português e o front em inglês: os tipos Api* descrevem o JSON que chega e
// as funções to* convertem para os tipos de src/lib/types.ts, que é o que as telas usam.

export interface ApiCategoria {
  id: number;
  slug: string;
  nome: string;
  _count?: { produtos: number };
}

export interface ApiBairro {
  id: number;
  slug: string;
  nome: string;
  _count?: { lojas: number };
}

interface ApiHorario {
  diaSemana: number;
  abre: string;
  fecha: string;
}

interface ApiLoja {
  id: number;
  slug: string;
  nome: string;
  endereco: string;
  cep: string | null;
  whatsapp: string;
  telefone: string | null;
  avaliacao: number | null;
  totalAvaliacoes: number;
  bairro: ApiBairro;
  horarios: ApiHorario[];
}

// GET /lojas/:id e /lojas/slug/:slug: a loja inteira, com os produtos
export interface ApiLojaPerfil extends ApiLoja {
  descricao: string | null;
  email: string | null;
  instagram: string | null;
  logoUrl: string | null;
  produtos: (Omit<ApiProduto, "loja"> & { categoria: ApiCategoria })[];
}

// GET /lojas: lista com a quantidade de produtos
export interface ApiLojaResumo extends ApiLoja {
  _count: { produtos: number };
}

export type ApiStatusEstoque = "DISPONIVEL" | "POUCAS_UNIDADES" | "ESGOTADO";

export interface ApiProduto {
  id: number;
  slug: string;
  nome: string;
  marca: string | null;
  descricao: string | null;
  detalhes: string[];
  // O Prisma manda Decimal como texto ("399.9")
  preco: string;
  precoAntigo: string | null;
  fotos: string[];
  tags: string[];
  destaque: boolean;
  statusEstoque: ApiStatusEstoque;
  lojaId: number;
  categoriaId: number;
  categoria: ApiCategoria;
  loja: ApiLoja;
}

export interface ApiReserva {
  id: number;
  nomeCliente: string;
  whatsappCliente: string;
  quantidade: number;
  status: ReservationStatus;
  criadoEm: string;
  expiraEm: string;
  produto: {
    id: number;
    nome: string;
    preco: string;
    loja: { id: number; nome: string; whatsapp: string };
  };
}

export interface ApiUsuario {
  id: number;
  nome: string;
  email: string;
  papel: Role;
  loja: { id: number; nome: string; slug: string } | null;
}

const STOCK: Record<ApiStatusEstoque, StockLevel> = {
  DISPONIVEL: "disponivel",
  POUCAS_UNIDADES: "poucas",
  ESGOTADO: "esgotado",
};

export const API_STOCK: Record<StockLevel, ApiStatusEstoque> = {
  disponivel: "DISPONIVEL",
  poucas: "POUCAS_UNIDADES",
  esgotado: "ESGOTADO",
};

export function toCategory(categoria: ApiCategoria): Category {
  return { slug: categoria.slug, name: categoria.nome };
}

export function toNeighborhood(bairro: ApiBairro): Neighborhood {
  return { slug: bairro.slug, name: bairro.nome };
}

export function toOption(item: { id: number; slug: string; nome: string }): Option {
  return { id: item.id, slug: item.slug, name: item.nome };
}

// A API manda só os dias em que a loja abre; o front usa 7 posições (0 = domingo, null = fechado)
function toHours(horarios: ApiHorario[]): (DayHours | null)[] {
  const hours: (DayHours | null)[] = Array(7).fill(null);
  for (const { diaSemana, abre, fecha } of horarios) {
    hours[diaSemana] = { open: abre, close: fecha };
  }
  return hours;
}

export function toApiHours(hours: (DayHours | null)[]): ApiHorario[] {
  return hours.flatMap((day, diaSemana) =>
    day ? [{ diaSemana, abre: day.open, fecha: day.close }] : [],
  );
}

function toStore(loja: ApiLoja): Store & { neighborhood: Neighborhood } {
  return {
    id: String(loja.id),
    slug: loja.slug,
    name: loja.nome,
    neighborhoodSlug: loja.bairro.slug,
    neighborhood: toNeighborhood(loja.bairro),
    address: loja.endereco,
    cep: loja.cep ?? "",
    whatsapp: loja.whatsapp,
    phone: loja.telefone ?? "",
    hours: toHours(loja.horarios),
    rating: loja.avaliacao ?? 0,
    reviewCount: loja.totalAvaliacoes,
  };
}

export function toListing(produto: ApiProduto): ProductListing {
  return {
    id: String(produto.id),
    slug: produto.slug,
    name: produto.nome,
    brand: produto.marca ?? undefined,
    categorySlug: produto.categoria.slug,
    category: toCategory(produto.categoria),
    storeId: String(produto.lojaId),
    store: toStore(produto.loja),
    price: Number(produto.preco),
    oldPrice: produto.precoAntigo ? Number(produto.precoAntigo) : undefined,
    stock: STOCK[produto.statusEstoque],
    description: produto.descricao ?? "",
    details: produto.detalhes,
    images: produto.fotos,
    featured: produto.destaque,
    tags: produto.tags,
  };
}

export function toManagedProduct(produto: ApiProduto): ManagedProduct {
  return { ...toListing(produto), categoryId: produto.categoriaId };
}

export function toStoreDetails(loja: ApiLoja & Partial<ApiLojaPerfil>): StoreDetails {
  return {
    ...toStore(loja),
    neighborhood: toOption(loja.bairro),
    description: loja.descricao ?? "",
    email: loja.email ?? "",
    instagram: loja.instagram ?? "",
    logoUrl: loja.logoUrl ?? "",
  };
}

export function toStoreProfile(loja: ApiLojaPerfil): StoreProfile {
  // Os produtos do perfil não trazem a loja de novo: devolvemos a loja a cada um
  const products = loja.produtos.map((produto) => toListing({ ...produto, loja }));
  return { ...toStoreDetails(loja), products };
}

export function toReservation(reserva: ApiReserva): Reservation {
  return {
    id: reserva.id,
    customerName: reserva.nomeCliente,
    customerWhatsapp: reserva.whatsappCliente,
    quantity: reserva.quantidade,
    status: reserva.status,
    createdAt: reserva.criadoEm,
    expiresAt: reserva.expiraEm,
    product: {
      id: reserva.produto.id,
      name: reserva.produto.nome,
      price: Number(reserva.produto.preco),
      store: {
        id: reserva.produto.loja.id,
        name: reserva.produto.loja.nome,
        whatsapp: reserva.produto.loja.whatsapp,
      },
    },
  };
}

export function toUserSummary(usuario: ApiUsuario): UserSummary {
  return {
    id: usuario.id,
    name: usuario.nome,
    email: usuario.email,
    role: usuario.papel,
    store: usuario.loja && {
      id: usuario.loja.id,
      name: usuario.loja.nome,
      slug: usuario.loja.slug,
    },
  };
}
