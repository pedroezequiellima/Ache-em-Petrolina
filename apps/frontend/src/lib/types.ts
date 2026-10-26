export type StockLevel = "disponivel" | "poucas" | "esgotado";

export type SortOrder = "relevancia" | "menor-preco" | "maior-preco";

export interface Category {
  slug: string;
  name: string;
}

export interface Neighborhood {
  slug: string;
  name: string;
}

export interface DayHours {
  open: string;
  close: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  neighborhoodSlug: string;
  address: string;
  cep: string;
  whatsapp: string;
  phone: string;
  hours: (DayHours | null)[];
  rating: number;
  reviewCount: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  categorySlug: string;
  storeId: string;
  price: number;
  oldPrice?: number;
  stock: StockLevel;
  description: string;
  details: string[];
  images: string[];
  featured?: boolean;
  tags?: string[];
}

export interface ProductListing extends Product {
  category: Category;
  store: Store & { neighborhood: Neighborhood };
}

export interface SearchFilters {
  q: string;
  categoria: string;
  bairro: string;
  estoque: boolean;
  ordem: SortOrder;
}

// ---- Área logada (painel) ----

export type Role = "ADMIN" | "LOJISTA";

export type ReservationStatus = "NOVA" | "CONFIRMADA" | "RETIRADA" | "CANCELADA" | "EXPIRADA";

// Categoria, bairro ou loja numa lista de escolha: o painel precisa do id para a API
export interface Option {
  id: number;
  slug: string;
  name: string;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerWhatsapp: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    store: { id: number; name: string; whatsapp: string };
  };
}

// Tudo o que o formulário da loja edita
export interface StoreDetails extends Store {
  neighborhood: Option;
  description: string;
  email: string;
  instagram: string;
  logoUrl: string;
}

// Página pública da loja: dados + produtos
export interface StoreProfile extends StoreDetails {
  products: ProductListing[];
}

// Produto como o painel edita: a API pede o id da categoria (id e storeId já vêm no ProductListing)
export interface ManagedProduct extends ProductListing {
  categoryId: number;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: Role;
  store: { id: number; name: string; slug: string } | null;
}

// Linha das listas de lojas, categorias e bairros do painel
export interface StoreSummary extends Option {
  neighborhood: string;
  productCount: number;
}

export interface TaxonomyItem extends Option {
  // Produtos (categoria) ou lojas (bairro) ligados: com algum, a API não deixa apagar
  usage: number;
}
