# Ache em Petrolina — Backend (API)

API REST do projeto **Ache em Petrolina**, feita com **NestJS** + **Prisma ORM** + **PostgreSQL**.

## Tecnologias

| Tecnologia | Versão | Para que serve |
|---|---|---|
| Node.js | 24 | Ambiente que executa o JavaScript/TypeScript no servidor |
| NestJS | 12 | Framework que organiza a API em módulos, controllers e services |
| TypeScript | 6 | JavaScript com tipagem — pega erros antes de rodar |
| Prisma ORM | 7.10.1 | Faz a ponte entre o código e o banco (sem escrever SQL na mão) |
| PostgreSQL | 17 | Banco de dados relacional |
| Docker | — | Sobe o Postgres localmente sem precisar instalar |
| Vitest | 4 | Testes automatizados |
| Oxlint / Prettier | — | Padronização e qualidade do código |

## Como rodar localmente

Pré-requisitos: **Node.js 24+** e **Docker Desktop** aberto.

> Este app faz parte dos **npm workspaces** do repositório: o `npm install` é feito na **raiz**. Da raiz também dá para usar `npm run dev:backend`, `build:backend`, `test:backend`, `lint:backend`, `db:up` e `db:down`.

```bash
cd apps/backend

# 1. Instalar dependências NA RAIZ do repositório (já roda o "prisma generate")
(cd ../.. && npm install)

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Subir o banco Postgres no Docker
npm run db:up

# 4. Criar as tabelas no banco
npx prisma migrate dev

# 5. Carregar os dados de exemplo (8 lojas e 30 produtos do front)
npm run db:seed

# 6. Rodar a API em modo desenvolvimento (reinicia ao salvar)
npm run start:dev
```

A API sobe em **http://localhost:3001**. Para testar se está tudo ok:

```bash
curl http://localhost:3001/health
# {"status":"ok","database":"up"}
```

## Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Roda a API com hot reload |
| `npm run build` | Compila para a pasta `dist/` |
| `npm run start:prod` | Roda a versão compilada |
| `npm test` | Roda os testes unitários |
| `npm run lint` | Verifica o padrão do código |
| `npm run db:up` / `db:down` | Sobe / derruba o Postgres no Docker |
| `npm run prisma:generate` | Gera o Prisma Client a partir do schema |
| `npm run prisma:migrate` | Cria e aplica migrations no banco |
| `npm run db:seed` | Carrega os dados de exemplo (pode rodar de novo) |
| `npm run prisma:studio` | Abre um painel visual do banco no navegador |

## Variáveis de ambiente

| Variável | Exemplo | Descrição |
|---|---|---|
| `PORT` | `3001` | Porta da API (o front usa a 3000) |
| `POSTGRES_USER` | `ache` | Usuário do Postgres (Docker) |
| `POSTGRES_PASSWORD` | `ache123` | Senha do Postgres (Docker) |
| `POSTGRES_DB` | `ache_petrolina` | Nome do banco (Docker) |
| `POSTGRES_PORT` | `5433` | Porta do Postgres no seu PC (5433 pra não conflitar com um Postgres já instalado) |
| `JWT_SECRET` | 64 caracteres aleatórios | Assina os tokens de login (32+ caracteres; nunca no Git) |
| `JWT_EXPIRA_EM` | `1d` | Validade do token |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | `admin@ache.local` | Admin criado pelo seed |
| `SEED_SENHA_LOJISTA` | `lojista-dev-123` | Senha dos lojistas de exemplo |
| `FRONTEND_URL` | `http://localhost:3000` | Endereço do front liberado no CORS |
| `FRONTEND_TOKEN` | 64 caracteres aleatórios (opcional) | Token que o servidor do Next manda no cabeçalho `x-frontend-token`: os GETs dele não entram no limite de 100 req/min por IP, e o login feito pelo site conta pelo IP do visitante (`x-cliente-ip`). Mesmo valor no `.env.local` do front (32+ caracteres; nunca no Git) |
| `RESERVA_VALIDADE_HORAS` | `24` | Horas até uma reserva expirar |
| `DATABASE_URL` | `postgresql://ache:ache123@localhost:5433/ache_petrolina?schema=public` | Conexão usada pelo Prisma |

> O `.env` **não vai pro Git** (está no `.gitignore`). Só o `.env.example` é versionado.

## Rotas

> 🔒 **Leitura do catálogo e criar reserva são públicos.** Criar/editar e ver reservas exigem login (`Authorization: Bearer <token>`). Matriz completa no [doc 08](docs/08-login-e-permissoes.md).

Documentação interativa (Swagger): **http://localhost:3001/docs**. Exemplos prontos em [`requests.http`](requests.http).

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API e o banco estão no ar |
| POST | `/auth/login` | Login: devolve o token JWT (5 tentativas/min) |
| GET / PATCH | `/auth/me` · `/auth/senha` | Quem sou eu · trocar senha 🔒 |
| POST | `/auth/esqueci-senha` · `/auth/redefinir-senha` | Pedir link por e-mail · criar senha nova com o código |
| POST / GET / DELETE | `/usuarios` | Cadastrar lojistas e admins 🔒 só ADMIN |
| POST / GET | `/lojas` | Cadastrar / listar lojas (`?bairro=` slug) |
| GET | `/lojas/slug/:slug` | Perfil da loja pelo slug |
| POST / GET | `/bairros` | Criar / listar bairros (`?comLojas=true`) |
| GET / PATCH / DELETE | `/bairros/:id` | Ver / editar / remover |
| GET / PATCH / DELETE | `/lojas/:id` | Perfil (com produtos) / editar / remover |
| POST / GET | `/categorias` | Criar / listar categorias |
| GET / PATCH / DELETE | `/categorias/:id` | Ver / editar / remover |
| POST / GET | `/produtos` | Cadastrar / catálogo (`?q=&categoria=&bairro=&comEstoque=&ordem=&destaque=&lojaId=&exceto=&limite=`) |
| GET | `/produtos/slug/:slug` | Página do produto |
| GET / PATCH / DELETE | `/produtos/:id` | Detalhes / editar / remover |
| PATCH | `/produtos/:id/estoque` | Mudar status de estoque |
| POST / GET | `/reservas` | Criar reserva / listar (`?status=&lojaId=&produtoId=`) |
| GET | `/reservas/:id` | Ver reserva |
| PATCH | `/reservas/:id/status` | Mudar status (NOVA → CONFIRMADA → RETIRADA, etc.) |

## Estrutura

```
apps/backend/
├── prisma/
│   ├── schema.prisma        # Modelos do banco (tabelas)
│   ├── migrations/          # Histórico de mudanças no banco (SQL)
│   ├── seed.ts              # Dados de exemplo: lojas, produtos, admin e lojistas
│   └── seed-data/           # JSON com os dados fictícios usados pelo seed
├── prisma.config.ts         # Configuração do Prisma CLI
├── docker-compose.yml       # Postgres para desenvolvimento
├── requests.http            # Requisições de exemplo (REST Client)
├── src/
│   ├── main.ts              # Sobe o servidor: validação, CORS, helmet, Swagger
│   ├── app.module.ts        # Módulo raiz: junta os outros, guards globais e limite de requisições
│   ├── app.controller.ts    # Rotas / e /health
│   ├── auth/                # Login (JWT), /auth/me, trocar e redefinir senha; guards e decorators
│   ├── usuarios/            # Contas de admin e lojistas (só o admin)
│   ├── email/               # EmailService (por enquanto escreve o e-mail no log)
│   ├── common/
│   │   ├── filters/         # Converte erros do Prisma em 404/409
│   │   ├── throttle/        # Exceções do limite para o servidor do Next (FRONTEND_TOKEN, IP do visitante)
│   │   ├── utils/           # slugify
│   │   └── validators/      # URL ou caminho (/mock/...) nas fotos e no logo
│   ├── prisma/              # PrismaModule + PrismaService (conexão)
│   ├── lojas/               # module, controller, service, dto/
│   ├── bairros/
│   ├── categorias/
│   ├── produtos/            # inclui busca.ts (busca com relevância)
│   ├── reservas/
│   └── generated/prisma/    # Prisma Client gerado (não vai pro Git)
└── test/                    # Testes end-to-end
```

## Documentação detalhada

Índice completo, linha do tempo e situação atual em [`docs/README.md`](docs/README.md):

- [01 — Inicialização](docs/01-inicializacao-nest-prisma.md)
- [02 — Módulos e CRUDs](docs/02-modulos-crud.md)
- [03 — Entendendo os módulos](docs/03-entendendo-os-modulos.md) (guia de estudo)
- [04 — Integração com o monorepo](docs/04-integracao-monorepo.md)
- [05 — Segurança](docs/05-seguranca.md)
- [06 — Análise do front e próximos passos](docs/06-analise-front-e-proximos-passos.md)
- [07 — Banco e API no formato do front](docs/07-integracao-com-o-front.md)
- [08 — Login e permissões](docs/08-login-e-permissoes.md)
