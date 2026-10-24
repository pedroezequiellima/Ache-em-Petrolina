# 06 — Análise do front e próximos passos

> Análise feita em 24/10/2026, lendo o código de `apps/frontend` que entrou na `main`.

## Como o front está hoje

O front (Next.js 16) está pronto visualmente, mas usa **dados de exemplo** que ficam no próprio código:

| Arquivo | Conteúdo |
|---|---|
| `src/data/stores.ts` | 8 lojas fictícias |
| `src/data/products.ts` | 30 produtos fictícios |
| `src/data/categories.ts` | 9 categorias (moda, calçados, eletrônicos...) |
| `src/data/neighborhoods.ts` | 18 bairros de Petrolina |
| `src/lib/types.ts` | O formato de cada dado |
| `src/lib/catalog.ts` | As funções que as páginas usam para buscar dados |

O README do front já diz o plano: **trocar o corpo das funções do `catalog.ts` por chamadas à API**, mantendo os mesmos nomes. Assim as páginas não precisam mudar.

Funções que a API precisa atender:

| Função do front | Rota da API que vai responder |
|---|---|
| `searchProducts(filtros)` | `GET /produtos?q=&categoria=&bairro=&estoque=&ordem=` |
| `getProductBySlug(slug)` | `GET /produtos/slug/:slug` (a criar) |
| `getFeaturedProducts(8)` | `GET /produtos?destaque=true&limite=8` (a criar) |
| `getStoreProducts(loja, exceto)` | `GET /produtos?lojaId=...` |
| `getCategories()` | `GET /categorias` |
| `getNeighborhoodsWithStores()` | `GET /bairros` (a criar) |

## O que não bate entre front e back

### Dados

| O front usa | O back tem hoje | Ajuste no back |
|---|---|---|
| Bairro com slug (`centro`, `areia-branca`) | Bairro como texto livre na loja | Tabela `Bairro` (nome + slug) ligada à loja |
| Produto aberto pelo slug na URL | Só por id | Campo `slug` único + rota por slug |
| Loja: `slug`, `cep`, `phone`, `hours` (horário por dia), `rating`, `reviewCount` | Não tem | Novos campos na `Loja` |
| Produto: `brand`, `oldPrice`, `details[]`, `featured`, `tags[]` | Não tem | Novos campos no `Produto` |

### Busca e formato

| O front faz | O back faz hoje | Ajuste |
|---|---|---|
| Busca sem acento, ignora "de/para" e plural, pesa mais o nome | `contains` simples, sensível a acento | Levar a lógica do `catalog.ts` para o `ProdutosService` |
| `?ordem=menor-preco` / `maior-preco` e `?estoque=1` | Não tem | Novos filtros |
| Esgotados aparecem por último | Ordena por data | Mesma regra no back |
| Fotos em `/mock/...svg` (caminho local) | `@IsUrl` aceita só URL completa | Aceitar caminho que começa com `/` |
| Estoque `disponivel` / `poucas` / `esgotado` | `DISPONIVEL` / `POUCAS_UNIDADES` / `ESGOTADO` | Converter no `catalog.ts` (lado do front) |
| Preço como número (`399.9`) | `Decimal` vira texto (`"399.9"`) | `Number()` no `catalog.ts` (o README do front já prevê) |
| IDs texto (`loja-1`) | IDs número (`1`) | O front usa o slug na URL, então não atrapalha |

## Próximos passos (em ordem)

1. **Checklist do PR** (doc 04): `npm install` na raiz, build/lint/testes, push e PR para a `main`.
2. **Ajustar o schema** ao modelo do front: tabela de bairros, slugs e campos novos (+ migration).
3. **Seed** (#6) com **os mesmos dados do front**: 8 lojas e 30 produtos. Quando o front ligar na API, ele mostra exatamente o que já mostra hoje.
4. **Busca no back** com relevância, ordenação e "só com estoque", com testes.
5. **Segurança** (doc 05): login dos lojistas, proteger reservas, rate limit, helmet.
6. **DevOps:** Dockerfile da API e `docker-compose.yml` na raiz (#6), depois o CI no GitHub Actions (#7).

Os passos 2 a 4 podem ir num segundo PR, menor e mais fácil de revisar.
