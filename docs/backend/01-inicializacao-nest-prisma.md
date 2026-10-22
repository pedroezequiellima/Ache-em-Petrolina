# 01 — Inicialização da API NestJS + Prisma

> **Issue:** [#5 — Inicializar API NestJS Back-End](https://github.com/pedroezequiellima/Ache-em-Petrolina/issues/5)
> **Branch:** `feat/backend-init`

## Objetivo

Criar a base do backend na pasta `/backend`, com NestJS, e deixar o Prisma ORM configurado e conectado a um PostgreSQL. Essa é a fundação em que os módulos de Lojas, Produtos e Reservas (issue #11) vão ser construídos.

---

## Conceitos (o que é cada coisa)

### O que é uma API?
É o "garçom" entre o front e o banco de dados. O front (Next.js) faz um pedido (`GET /produtos?bairro=Centro`), a API busca no banco e devolve os dados em JSON. O front **nunca** acessa o banco direto — isso garante segurança e regras de negócio centralizadas.

### Por que NestJS?
NestJS é um framework Node.js que **impõe uma organização**. Em vez de cada um do grupo organizar o código de um jeito, o Nest define um padrão:

| Peça | Papel | Analogia (restaurante) |
|---|---|---|
| **Module** | Agrupa tudo de uma funcionalidade (ex: tudo de Produtos) | A seção da cozinha (ex: confeitaria) |
| **Controller** | Recebe a requisição HTTP e define as rotas (`GET /produtos`) | O garçom: recebe o pedido e entrega o prato |
| **Service** | Contém a lógica de negócio e fala com o banco | O cozinheiro: faz o prato de verdade |
| **DTO** | Define e valida o formato dos dados que chegam | O cardápio: só aceita pedidos que existem |
| **Prisma** | Acessa o banco de dados | A despensa |

**Por que separar Controller de Service?**
- **Responsabilidade única:** o controller só cuida de HTTP (rota, status, parâmetros); o service só cuida da regra (ex: "não pode reservar produto esgotado").
- **Reutilização:** o `ReservasService` pode chamar o `ProdutosService` para checar estoque, sem passar por HTTP.
- **Testabilidade:** dá pra testar o service sozinho, sem subir servidor.

**Por que Modules?**
- Cada funcionalidade fica isolada numa pasta (`lojas/`, `produtos/`, `reservas/`). Dá pra cada pessoa do grupo mexer num módulo sem conflitar com o outro.
- O `AppModule` é o módulo raiz que "pluga" todos os outros.

### Injeção de dependência
No Nest, você **não** faz `new PrismaService()` dentro do service. Você declara no construtor que precisa dele e o Nest entrega pronto:

```ts
constructor(private readonly prisma: PrismaService) {}
```

Vantagens: uma única conexão com o banco compartilhada pela API toda, e nos testes dá pra trocar o Prisma real por um "falso" (mock) — foi exatamente o que fizemos no teste do `/health`.

### O que é ORM / Prisma?
ORM = *Object-Relational Mapping*. Em vez de escrever SQL na mão:

```sql
SELECT * FROM produtos WHERE bairro = 'Centro';
```

escrevemos TypeScript com autocomplete e checagem de tipos:

```ts
prisma.produto.findMany({ where: { bairro: 'Centro' } });
```

O Prisma tem 3 partes:
1. **`schema.prisma`** — onde descrevemos as tabelas (modelos).
2. **Prisma Migrate** — transforma o schema em tabelas reais no banco, com histórico de versões (migrations).
3. **Prisma Client** — código gerado automaticamente a partir do schema, que usamos para fazer as consultas.

---

## Passo a passo do que foi feito

### 1. Clonar o repositório e criar a branch
```bash
gh repo clone pedroezequiellima/Ache-em-Petrolina .
git checkout -b feat/backend-init
```
**Por quê:** trabalhar numa branch separada evita mexer na `main` do grupo. Quando terminar, abre-se um Pull Request para revisão.

### 2. Criar o projeto NestJS
```bash
npx @nestjs/cli new backend --package-manager npm --skip-git --strict
```
- `--skip-git`: o Git já existe na raiz do repositório (monorepo com `/frontend` e `/backend`), não queremos um Git dentro do outro.
- `--strict`: ativa o modo estrito do TypeScript, que pega mais erros em tempo de compilação.

O Nest 12 já vem com **Vitest** (testes), **Oxlint** (lint) e **Prettier** (formatação) — o que vai ser útil para o pipeline de CI (issue #7).

### 3. Instalar o Prisma
```bash
npm i -D -E prisma@7.10.1
npm i -E @prisma/client@7.10.1 @prisma/adapter-pg@7.10.1 pg @nestjs/config dotenv
npm i -D @types/pg
```

| Pacote | Para que serve |
|---|---|
| `prisma` (dev) | CLI: `init`, `generate`, `migrate`, `studio` |
| `@prisma/client` | Biblioteca usada no código para consultar o banco |
| `@prisma/adapter-pg` + `pg` | Driver de conexão com Postgres (exigido a partir do Prisma 7) |
| `@nestjs/config` | Lê o arquivo `.env` dentro do Nest |
| `dotenv` | Lê o `.env` para o Prisma CLI |

> ⚠️ **Problema encontrado:** o `npm` estava marcando como "latest" uma versão **release candidate** (instável) do Prisma, a `8.0.0-rc.26`, enquanto o `@prisma/client` vinha na `7.10.1`. Versões diferentes entre CLI e client causam erro. **Solução:** fixamos tudo na versão estável `7.10.1` com a flag `-E` (versão exata), garantindo que todo o grupo instale exatamente a mesma versão.

### 4. Inicializar o Prisma
```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```
Criou:
- `prisma/schema.prisma` — o schema (ainda sem modelos; eles vêm na issue #11/#6).
- `prisma.config.ts` — configuração do CLI (onde está o schema, as migrations e a URL do banco).
- `.env` — variáveis de ambiente.

O Prisma Client é gerado em `src/generated/prisma` e **não vai pro Git** — ele é recriado automaticamente pelo script `postinstall` sempre que alguém roda `npm install`.

### 5. Banco PostgreSQL com Docker
Criamos um `backend/docker-compose.yml` que sobe só o Postgres:

```bash
npm run db:up      # docker compose up -d
```

**Por que Docker:** ninguém do grupo precisa instalar Postgres no computador; todo mundo usa exatamente a mesma versão (17). Um **volume** (`postgres_data`) mantém os dados mesmo se o container for reiniciado.

**Porta 5433:** dentro do container o Postgres usa a porta padrão 5432, mas no computador ele fica exposto na **5433** (`'5433:5432'` no compose). Veja o motivo em "Problemas encontrados".

> Esse compose é só para desenvolvimento do backend. O compose completo (front + back + banco) é a issue #6.

### 6. Variáveis de ambiente
- `.env.example` — modelo **versionado** com todas as variáveis necessárias.
- `.env` — cópia local com os valores reais, **ignorada pelo Git** (senhas não devem ir para o repositório).

### 7. PrismaService e PrismaModule
- **`src/prisma/prisma.service.ts`** — estende o `PrismaClient` e o transforma num provider do Nest. Conecta ao banco quando a API sobe (`onModuleInit`) e desconecta quando ela desliga (`onModuleDestroy`).
- **`src/prisma/prisma.module.ts`** — marcado com `@Global()`, então qualquer módulo futuro (Lojas, Produtos, Reservas) pode injetar o `PrismaService` sem precisar importar nada.
- **`src/app.module.ts`** — passou a importar o `ConfigModule` (lê o `.env`) e o `PrismaModule`.

### 8. Rota de health check
Adicionamos `GET /health`, que executa um `SELECT 1` no banco:

```json
{ "status": "ok", "database": "up" }
```

**Por quê:** prova que a API está no ar **e** conectada ao banco. Também vai ser útil no Docker/CI (issues #6 e #7) para checar se o container está saudável.

### 9. Scripts npm
Adicionados ao `package.json` para facilitar o dia a dia: `db:up`, `db:down`, `prisma:generate`, `prisma:migrate`, `prisma:studio` e `postinstall`.

### 10. Verificação
```bash
npm run build   # ✅ compila sem erros
npm test        # ✅ 2 testes passando (rota / e /health com Prisma mockado)
npm run lint    # ✅ sem problemas
npm run db:up && npm run start:dev
curl http://localhost:3000/health
# ✅ {"status":"ok","database":"up"}
```

---

## Problemas encontrados (e como resolvemos)

| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | CLI do Prisma em versão `8.0.0-rc.26` e client em `7.10.1` | O `npm` marcava uma release candidate como "latest" | Fixar tudo em `7.10.1` com `npm i -E` |
| 2 | `prisma init` gerou o arquivo como `prisma7.config.ts` | Comportamento da CLI | Renomeado para `prisma.config.ts`, o nome padrão que o Prisma procura |
| 3 | `docker compose up` falhou: *failed to connect to the docker API* | Docker Desktop estava fechado | Abrir o Docker Desktop antes de subir o banco |
| 4 | `/health` retornou 500: *autenticação do tipo senha falhou para o usuário "ache"* | Já havia um **PostgreSQL 18 instalado no Windows** usando a porta 5432. A API conectava nele, não no container. A pista: a mensagem veio em português (o Postgres do Docker responde em inglês) | Expor o container na porta **5433** (configurável por `POSTGRES_PORT`) |
| 5 | `/health` retornou 500: *the database system is starting up* | O container tinha acabado de ser recriado e o Postgres ainda estava inicializando | Aguardar alguns segundos. Fica a lição: na issue #6 o compose deve ter um **healthcheck** e o backend só subir depois do banco estar pronto (`depends_on: condition: service_healthy`) |

> Dica: depois de mudar o `.env`, é preciso **reiniciar** o `npm run start:dev`. O modo watch recarrega o código, mas não as variáveis de ambiente.

---

## Decisões tomadas

| Decisão | Motivo |
|---|---|
| PostgreSQL | Definido na issue #6 |
| Prisma 7.10.1 fixo | Versão estável; evita a RC instável que o npm marcava como latest |
| `PrismaModule` global | Todos os módulos de domínio usam o banco; evita repetir import |
| Compose só do banco dentro de `/backend` | Não conflitar com o compose completo da issue #6 |
| Client gerado fora do Git + `postinstall` | Código gerado não deve ser versionado; é recriado no `npm install` |

## Próximos passos
- Issue #11: modelar Loja, Produto, Categoria e Reserva no `schema.prisma` e criar os módulos (CRUDs).
