# 07 — Banco e API no formato do front

> **Data:** 24/10/2026 · direto na `main` (combinado com o grupo: o backend é feito por uma pessoa só)
> Resolve os itens 2, 3 e 4 do [plano do doc 06](06-analise-front-e-proximos-passos.md).
>
> 🔒 Depois deste doc entrou o **login** ([doc 08](08-login-e-permissoes.md)): as rotas de **leitura** do catálogo continuam públicas, mas criar/editar e ver reservas agora exigem login.

## Objetivo

Deixar a API entregando **tudo o que o front já mostra com os dados de exemplo**, para o pessoal do front só trocar o corpo das funções do `catalog.ts` por chamadas à API.

---

## 1. Mudanças no banco

Migration: `prisma/migrations/20261024170000_alinha_modelo_do_front/`

```mermaid
erDiagram
    BAIRRO ||--o{ LOJA : "tem"
    LOJA ||--o{ HORARIO_LOJA : "abre em"
    LOJA ||--o{ PRODUTO : "vende"
    CATEGORIA ||--o{ PRODUTO : "agrupa"
    PRODUTO ||--o{ RESERVA : "recebe"

    BAIRRO { int id PK; string nome UK; string slug UK }
    LOJA { int id PK; string slug UK; string nome; string whatsapp; string telefone; string endereco; string cep; int bairroId FK; float avaliacao; int totalAvaliacoes }
    HORARIO_LOJA { int id PK; int lojaId FK; int diaSemana; string abre; string fecha }
    CATEGORIA { int id PK; string nome UK; string slug UK }
    PRODUTO { int id PK; string slug UK; string nome; string marca; decimal preco; decimal precoAntigo; string[] detalhes; string[] fotos; string[] tags; boolean destaque; enum statusEstoque }
    RESERVA { int id PK; string nomeCliente; string whatsappCliente; int quantidade; enum status; datetime expiraEm }
```

| Mudança | Por quê |
|---|---|
| **Tabela `Bairro`** (nome + slug), ligada à loja | O front filtra com `?bairro=centro`. Antes o bairro era texto livre: "Centro", "centro" e "Centro " seriam bairros diferentes |
| **Tabela `HorarioLoja`**: um registro por dia aberto (`diaSemana` 0–6, `abre`, `fecha`) | O front mostra "Aberto agora" e o horário da semana. Dia sem registro = fechado. Uma linha por dia é mais fácil de consultar e validar do que um JSON |
| Loja: `slug`, `telefone`, `cep`, `avaliacao`, `totalAvaliacoes` | Campos que a página do produto exibe (Ligar, endereço completo, nota) |
| Produto: `slug`, `marca`, `precoAntigo`, `detalhes[]`, `tags[]`, `destaque` | A página do produto abre pelo slug; preço "de/por"; lista de detalhes; destaques da home; tags ajudam a busca |
| Apagar bairro com lojas = **bloqueado** (409) | Não deixar loja sem bairro |

`diaSemana` segue o padrão do JavaScript (`new Date().getDay()`): 0 = domingo. É o mesmo índice do array `hours` do front.

## 2. Seed: os dados do front no banco (#6)

```bash
npm run db:seed
```

- Os dados de `apps/frontend/src/data` foram exportados **uma vez** para `prisma/seed-data/*.json`. Assim o seed não quebra quando o front apagar os dados de exemplo.
- `prisma/seed.ts` grava: **9 categorias, 18 bairros, 8 lojas (com 50 horários) e 30 produtos**.
- Usa `upsert` pelo slug: **pode rodar quantas vezes quiser, não duplica**.
- Dados **fictícios**: os WhatsApp usam o prefixo `9 0000`, que não existe.

> A issue #6 pede "5 lojas e 15 produtos". Usamos os 8 e 30 do front para o site mostrar exatamente o que já mostra hoje.

## 3. Busca no backend (com relevância)

A lógica que estava no `catalog.ts` do front foi trazida para `src/produtos/busca.ts`, com as mesmas regras:

| Regra | Exemplo |
|---|---|
| Ignora acentos e maiúsculas | `tenis` acha "Tênis" |
| Ignora palavras vazias | `bota para festa` vira `bota festa` |
| Plural simples | `sandalias` acha "Sandália" |
| Todos os termos precisam aparecer | `nike adidas` não acha o tênis Nike |
| Peso: termo no nome/marca vale 3, no resto vale 1 | o tênis Nike aparece antes de um produto que só cita "nike" na descrição |
| Esgotados sempre por último | mesmo ordenando por preço |
| Empate: destaque, depois estoque, depois ordem alfabética | |

**Como funciona:** o banco filtra o que é exato (categoria, bairro, preço, estoque, loja) e devolve a lista; a busca por termo e a ordenação são feitas em memória pelo `buscarEOrdenar`. Para o tamanho do MVP (dezenas ou centenas de produtos) isso é rápido. Se o catálogo crescer muito, o próximo passo é a busca de texto do próprio Postgres (`tsvector` + extensão `unaccent`).

Testes: `src/produtos/busca.spec.ts` (8 testes, incluindo o exemplo `tenis nike 42` do README do front).

## 4. Rotas novas e alteradas

| Rota | O que mudou |
|---|---|
| `GET /produtos` | Filtros renomeados para os nomes do front (`q` em vez de `busca`; `bairro` agora é **slug**) e novos filtros (tabela abaixo) |
| `GET /produtos/slug/:slug` | **Nova.** Página do produto |
| `GET /lojas?bairro=` | O filtro agora é o **slug** do bairro |
| `GET /lojas/slug/:slug` | **Nova.** Perfil da loja |
| `/bairros` | **Novo módulo** (CRUD). `GET /bairros?comLojas=true` = só bairros com loja, do que tem mais para o que tem menos |

**Filtros de `GET /produtos`:**

| Parâmetro | Exemplo | Função do front que usa |
|---|---|---|
| `q` | `tenis nike` | `searchProducts` |
| `categoria` | `calcados` (slug) | `searchProducts` |
| `bairro` | `centro` (slug) | `searchProducts` |
| `comEstoque` | `1` ou `true` | `searchProducts` (filtro "só com estoque") |
| `ordem` | `relevancia` · `menor-preco` · `maior-preco` | `searchProducts` |
| `destaque` | `true` | `getFeaturedProducts` |
| `lojaId` + `exceto` | `1` + `tenis-nike-...` | `getStoreProducts` |
| `limite` | `8` (máx. 100) | `getFeaturedProducts`, `getStoreProducts` |
| `statusEstoque`, `precoMin`, `precoMax` | | (extras) |

## 5. Como o front troca os mocks pela API

Correspondência entre `src/lib/catalog.ts` e a API:

| Função do front | Chamada |
|---|---|
| `searchProducts(filtros)` | `GET /produtos?q=&categoria=&bairro=&comEstoque=&ordem=` |
| `getFeaturedProducts(8)` | `GET /produtos?destaque=true&comEstoque=1&limite=8` |
| `getProductBySlug(slug)` | `GET /produtos/slug/:slug` (404 → `null`) |
| `getProductSlugs()` | `GET /produtos` e pegar os `slug` |
| `getStoreProducts(loja, exceto, 4)` | `GET /produtos?lojaId=&exceto=&limite=4` |
| `getCategories()` | `GET /categorias` |
| `getNeighborhoods()` | `GET /bairros` |
| `getNeighborhoodsWithStores()` | `GET /bairros?comLojas=true` (`_count.lojas` = `storeCount`) |

**Conversões de nomes** (a API usa português, o front usa inglês):

| API | Front | Conversão |
|---|---|---|
| `nome`, `marca`, `descricao`, `detalhes`, `fotos`, `destaque` | `name`, `brand`, `description`, `details`, `images`, `featured` | renomear |
| `preco`, `precoAntigo` (texto: `"399.9"`) | `price`, `oldPrice` (número) | `Number(...)` |
| `statusEstoque`: `DISPONIVEL` / `POUCAS_UNIDADES` / `ESGOTADO` | `stock`: `disponivel` / `poucas` / `esgotado` | tabela de-para |
| `loja.horarios`: `[{ diaSemana: 1, abre, fecha }, ...]` | `hours`: array de 7 posições (`null` = fechado) | montar o array de 7 pelo `diaSemana` |
| `loja.bairro` (`{ nome, slug }`) | `store.neighborhood` (`{ name, slug }`) | renomear |
| `loja.telefone`, `loja.avaliacao`, `loja.totalAvaliacoes` | `phone`, `rating`, `reviewCount` | renomear |

> O README do front lembra: com **Cache Components** do Next 16, cada `fetch` precisa de `"use cache"` + `cacheLife(...)` ou ficar dentro de `<Suspense>`. A URL da API deve ir no `.env.example` do front (ex: `API_URL=http://localhost:3001`).

---

## Problemas encontrados (e como resolvemos)

| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | `migrate dev` recusou criar a migration | O banco local tinha lojas e produtos de teste sem `bairroId` e `slug` (colunas obrigatórias novas) | Com autorização, **resetamos o banco local** (só dados de teste) e o seed repovoou |
| 2 | `migrate dev` não roda no terminal do agente | Ele é interativo e pede confirmação dos avisos | Geramos o SQL com `prisma migrate diff` e aplicamos com `migrate deploy` |
| 3 | A primeira migration gerada saiu **vazia** e foi marcada como aplicada | O `migrate diff --from-migrations` exige um banco "sombra"; o erro foi escondido pelo `2>/dev/null` | Comparamos com o banco atual (`--from-config-datasource`), resetamos de novo e conferimos que o schema bate com o banco (diferença vazia). **Lição: não esconder erros** |
| 4 | A regex que tira acentos ficou com caracteres invisíveis e depois quebrou (`[0300-036f]`) | Duas ferramentas interpretaram o `\u` de jeitos diferentes (o `sed` trata `\u` como "maiúscula") | Trocamos por `/\p{M}/gu` ("qualquer marca de acento"), que é mais legível e não depende de `\u` |
| 5 | **A API não subia** (`string is not defined`), mesmo com build e testes passando | O plugin do Swagger rodava com o TypeScript 5.9 do front, que fica na raiz, e o Nest compila com o TypeScript 6. Duas versões geram metadados errados. **Existia desde a mudança para o monorepo** | Desligamos o plugin e documentamos cada campo com `@ApiProperty` no DTO. Fica explícito e não depende da versão do TypeScript. **Lição: o checklist precisa subir a API, não só compilar** |

## Verificação

| | Resultado |
|---|---|
| Build, lint, testes | ✅ 23 testes (eram 15 + 8 da busca) |
| API rodando com os dados do seed | ✅ busca, filtros, slugs, bairros, horários, reserva, erros 400/404 |
| Swagger (`/docs`) | ✅ todos os campos e filtros aparecem |
