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
| [07 — Banco e API no formato do front](07-integracao-com-o-front.md) | Bairros, horários, slugs, seed, busca com relevância, como o front troca os mocks | **Para o pessoal do front** |
| [08 — Login e permissões](08-login-e-permissoes.md) | JWT, bcrypt, papéis ADMIN/LOJISTA, matriz de rotas protegidas, limite de requisições | Segurança |

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
| 24/10 | `.gitattributes` (LF), lock da raiz com o backend, remoção do `@nestjs/mau`, checklist verde | `chore: força LF no Git, inclui o backend no lock...` |
| 24/10 | **PR #12 juntado na `main`** (merge feito pelo Daniel no GitHub) | `Merge pull request #12` |
| 24/10 | Banco no formato do front (bairros, horários, slugs), seed com os dados do front, busca com relevância, Swagger sem plugin | `feat(backend): alinha banco e API ao modelo do front` |
| 24/10 | Login com JWT, papéis ADMIN/LOJISTA, rotas protegidas, reservas só da própria loja, limite de requisições | `feat(backend): login com JWT e rotas protegidas por papel` |
| 24/10 | "Esqueci minha senha" (link de uso único, 30 min) e cabeçalhos de segurança (helmet) | `feat(backend): esqueci minha senha e cabeçalhos de segurança` |
| 26/10 | Front troca os dados de exemplo pela API (catálogo, busca, produto) | (ainda sem commit) |
| 26/10 | `FRONTEND_TOKEN`: as leituras do servidor do Next ficam fora do limite de 100 req/min; o login feito pelo site conta pelo IP do visitante (`x-cliente-ip`). Ver doc 08 | (ainda sem commit) |
| 26/10 | Front: telas de login, esqueci/redefinir senha, reserva, página da loja, `/status` e painel completo (lojista e admin) usando todas as rotas da API | (ainda sem commit) |

## Situação atual

| Item | Status |
|---|---|
| #5 Inicializar API | ✅ Na `main` (PR #12) |
| #11 Módulos CRUD | ✅ Na `main` (PR #12) |
| Modelagem do banco (parte da #6) | ✅ Pronto |
| Testes depois da mudança de pasta | ✅ Tudo passando (front e back) |
| `package-lock.json` da raiz | ✅ Atualizado |
| `npm audit` | ⚠️ 1 pendência (multer, não afeta: sem upload) |
| Push e Pull Request | ✅ PR #12 juntado |
| Ajuste do banco ao modelo do front | ✅ Pronto (doc 07) |
| Seed com dados do front | ✅ 8 lojas e 30 produtos |
| Busca com relevância no back | ✅ Pronto |
| Login e proteção das reservas | ✅ Pronto (doc 08) |
| Esqueci minha senha + helmet | ✅ Pronto (doc 08) |
| Tela de login no front | ✅ `/entrar` e `/painel` (README do front); login conta pelo IP do visitante (doc 08) |
| Front ligado em todas as rotas | ✅ Reserva, página da loja, `/status` e painel completo (README do front) |

## Números

- **8** tabelas · **8** módulos · **35** rotas (27 de catálogo/reservas + 5 de login + 3 de usuários) + `/health` e `/docs`
- **51** testes unitários + 1 e2e · build e lint passando; API testada rodando com o seed, incluindo cada permissão (24/10) e pelas telas do front (26/10)
- Portas: front **3000** · API **3001** · Postgres **5433**
