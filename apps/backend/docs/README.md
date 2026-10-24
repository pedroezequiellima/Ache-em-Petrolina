# Documentação do backend — Ache em Petrolina

Tudo o que foi feito na API, por quê e o que falta.
Responsável: Daniel · Issues [#5](https://github.com/pedroezequiellima/Ache-em-Petrolina/issues/5) e [#11](https://github.com/pedroezequiellima/Ache-em-Petrolina/issues/11).

## Índice

| Doc | Assunto | Bom para |
|---|---|---|
| [01 — Inicialização](01-inicializacao-nest-prisma.md) | Criar o NestJS, configurar Prisma, Postgres no Docker, `/health` | Entender a base |
| [02 — Módulos e CRUDs](02-modulos-crud.md) | Banco (4 tabelas), rotas, regras de reserva, validação, erros, Swagger, testes | Referência das rotas |
| [03 — Entendendo os módulos](03-entendendo-os-modulos.md) | Cada pasta e arquivo, por que module/controller/service/DTO, perguntas do professor | **Estudar para a apresentação** |
| [04 — Integração com o monorepo](04-integracao-monorepo.md) | Rebase na `main`, mudança para `apps/backend`, porta 3001, CORS, scripts | Entender o Git e o PR |
| [05 — Segurança](05-seguranca.md) | O que está protegido e o que falta | Revisão de segurança |
| [06 — Análise do front](06-analise-front-e-proximos-passos.md) | O que o front precisa da API e o plano | Próximos passos |

Requisições prontas para testar: [`../requests.http`](../requests.http) (extensão REST Client do VS Code).
Como rodar: [`../README.md`](../README.md).

## Linha do tempo

| Data | O que foi feito | Commit |
|---|---|---|
| 22/10 | Repositório clonado (ainda vazio), branch `feat/backend-init` | — |
| 22/10 | NestJS 12 criado; Prisma 7.10.1 + PostgreSQL 17 no Docker; rota `/health` | `feat(backend): inicializa API NestJS com Prisma e PostgreSQL` |
| 22/10 | Schema com Loja, Categoria, Produto e Reserva; 4 módulos com CRUD; validação, erros, Swagger e 15 testes | `feat(backend): modela banco e cria módulos...` |
| 22/10 | Guia de estudo dos módulos | `docs(backend): adiciona guia de estudo dos módulos` |
| 24/10 | Grupo sobe o front e reorganiza em monorepo (`apps/`) | (commits do grupo) |
| 24/10 | Rebase na `main`, backend movido para `apps/backend`, API na porta 3001, CORS restrito, scripts na raiz | `refactor(backend): move a API para apps/backend no monorepo` |
| 24/10 | Docs de integração, segurança e análise do front | `docs(backend): documenta integração, segurança e análise do front` |

## Situação atual

| Item | Status |
|---|---|
| #5 Inicializar API | ✅ Pronto (local, falta PR) |
| #11 Módulos CRUD | ✅ Pronto (local, falta PR) |
| Modelagem do banco (parte da #6) | ✅ Pronto |
| Testes depois da mudança de pasta | ⏳ Falta rodar |
| `package-lock.json` da raiz | ⏳ Falta `npm install` |
| Push e Pull Request | ⏳ Aguardando |
| Ajuste do banco ao modelo do front | 📋 Planejado (doc 06) |
| Seed com dados do front | 📋 Planejado |
| Login e proteção das reservas | 📋 Planejado (doc 05) |

## Números

- **4** tabelas · **4** módulos · **20** rotas nos módulos + `/health` e `/docs`
- **15** testes unitários + 1 e2e (todos passando na última execução, antes da mudança de pasta)
- Portas: front **3000** · API **3001** · Postgres **5433**
