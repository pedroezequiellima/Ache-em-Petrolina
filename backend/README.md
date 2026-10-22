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

```bash
cd backend

# 1. Instalar dependências (já roda o "prisma generate" sozinho)
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Subir o banco Postgres no Docker
npm run db:up

# 4. Rodar a API em modo desenvolvimento (reinicia ao salvar)
npm run start:dev
```

A API sobe em **http://localhost:3000**. Para testar se está tudo ok:

```bash
curl http://localhost:3000/health
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
| `npm run prisma:studio` | Abre um painel visual do banco no navegador |

## Variáveis de ambiente

| Variável | Exemplo | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta da API |
| `POSTGRES_USER` | `ache` | Usuário do Postgres (Docker) |
| `POSTGRES_PASSWORD` | `ache123` | Senha do Postgres (Docker) |
| `POSTGRES_DB` | `ache_petrolina` | Nome do banco (Docker) |
| `POSTGRES_PORT` | `5433` | Porta do Postgres no seu PC (5433 pra não conflitar com um Postgres já instalado) |
| `DATABASE_URL` | `postgresql://ache:ache123@localhost:5433/ache_petrolina?schema=public` | Conexão usada pelo Prisma |

> O `.env` **não vai pro Git** (está no `.gitignore`). Só o `.env.example` é versionado.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Hello World (teste básico) |
| GET | `/health` | Verifica se a API e o banco estão no ar |

## Estrutura

```
backend/
├── prisma/
│   └── schema.prisma        # Modelos do banco (tabelas)
├── prisma.config.ts         # Configuração do Prisma CLI
├── docker-compose.yml       # Postgres para desenvolvimento
├── src/
│   ├── main.ts              # Ponto de entrada: sobe o servidor
│   ├── app.module.ts        # Módulo raiz: junta todos os outros
│   ├── app.controller.ts    # Rotas / e /health
│   ├── app.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts   # Disponibiliza o Prisma para a API toda
│   │   └── prisma.service.ts  # Conexão com o banco
│   └── generated/prisma/    # Prisma Client gerado (não vai pro Git)
└── test/                    # Testes end-to-end
```

## Documentação detalhada

Explicação passo a passo do que foi feito e por quê: [`docs/backend/`](../docs/backend/).
