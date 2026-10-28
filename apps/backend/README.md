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

## Rotas

> 🔒 **Leitura do catálogo e criar reserva são públicos.** Criar/editar e ver reservas exigem login (`Authorization: Bearer <token>`). Matriz completa no [doc 08](docs/08-login-e-permissoes.md).

Documentação interativa

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
