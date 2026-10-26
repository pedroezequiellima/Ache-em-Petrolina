# Ache em Petrolina

> Encontre o produto em lojas de Petrolina, veja onde tem, reserve sem pagar online e retire ou
> fale direto com a loja.

Catálogo de estoque local para o comércio de Petrolina (PE). O cliente busca um produto, vê quais
lojas têm, reserva informando só nome, WhatsApp e quantidade, e paga na retirada. A loja confirma
pelo WhatsApp.

Projeto da **Academia Softex DevOps**. Equipe: Pedro Ezequiel, Lívia Christina, Jamilly, João,
Elder, Luan e Daniel.

## Situação atual (26/10/2026)

- **Back-end** (`apps/backend`, NestJS + Prisma + PostgreSQL): API completa do MVP, com login (JWT),
  permissões de admin e lojista, busca com relevância, reservas e recuperação de senha. Detalhes em
  [apps/backend/README.md](apps/backend/README.md) e [apps/backend/docs](apps/backend/docs/README.md).
- **Front-end** (`apps/frontend`, Next.js 16): conectado a **todas** as rotas da API. Site
  público (busca, produto, **reserva**, página da loja, `/status`) e **painel** em `/painel`
  (reservas, produtos e estoque, dados da loja, e para o admin: lojas, usuários, categorias e
  bairros). Detalhes em [apps/frontend/README.md](apps/frontend/README.md).
- **Próximos passos:** `docker-compose.yml` e Dockerfiles na raiz, o CI em `.github/workflows`,
  um provedor de e-mail de verdade (hoje a API só escreve o e-mail no log) e upload de fotos.

## Estrutura do repositório

```
.github/workflows/   GitHub Actions (CI/CD); vazio por enquanto
apps/
  frontend/          interface web em Next.js 16 + TypeScript + Tailwind CSS 4 (#4, #9)
  backend/           API REST em NestJS + Prisma + PostgreSQL (#5, #11)
packages/            pacotes compartilhados entre os apps (ex.: shared); vazio por enquanto
.dockerignore        arquivos que o Docker ignora ao montar as imagens
.gitignore           arquivos que não vão para o Git
package.json         workspaces do npm e scripts globais
README.md            este arquivo
```

Cada app tem seu próprio código e `package.json`. O `docker-compose.yml` da raiz (para subir front,
API e banco com um comando) e os Dockerfiles ainda serão criados; por enquanto o Postgres sobe com o
`docker-compose.yml` de `apps/backend` (`npm run db:up`). O andamento das tarefas fica no GitHub Projects **Ache-em-Petrolina**.

## Requisitos

- **Node.js 20.9 ou mais novo** (usamos o 24; veja `.nvmrc`)
- npm (vem com o Node)
- Git
- **Docker Desktop** aberto, para o banco PostgreSQL (`npm run db:up`)

## Como rodar

Os comandos `npm` rodam na **raiz** do repositório: ela usa npm workspaces e instala as
dependências de todos os apps de uma vez. Precisa do **Docker** para o banco.

```bash
git clone https://github.com/pedroezequiellima/Ache-em-Petrolina.git
cd Ache-em-Petrolina
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run db:up                                   # PostgreSQL no Docker
(cd apps/backend && npx prisma migrate deploy)
npm run db:seed                                 # lojas, produtos e contas de exemplo
npm run dev:backend                             # API em http://localhost:3001 (docs em /docs)
npm run dev                                     # site em http://localhost:3000 (outro terminal)
```

Antes de subir, troque no `apps/backend/.env` o `JWT_SECRET` e gere um `FRONTEND_TOKEN` (o mesmo
valor vai no `apps/frontend/.env.local`); os dois arquivos explicam como. No **Prompt de Comando
(cmd)** do Windows, troque o `cp` por `copy`.

Contas de exemplo do seed: o admin (`ADMIN_EMAIL`/`ADMIN_SENHA` do `.env` da API) e um lojista
por loja (`<slug-da-loja>@lojista.local`, senha `SEED_SENHA_LOJISTA`). Entre em
http://localhost:3000/entrar.

## Fluxo de trabalho

- **Branches:** por enquanto só existe a `main`. Para cada nova tarefa, crie uma branch a partir
  dela e abra um Pull Request. Combinem o padrão de nomes antes de criar.
- **Pull Requests** com pelo menos **1 revisão** de outro integrante. Escreva `Closes #<número>`
  na descrição: a issue fecha sozinha quando o PR entra na `main`.
- **Antes de abrir o PR**, na raiz: `npm run format`, `npm run lint` e `npm run build` precisam
  passar.
- **Commits** no padrão Conventional Commits: `feat: ...`, `fix: ...`, `refactor: ...`,
  `docs: ...`, `chore: ...`.

## Segurança

Revisão atualizada em 26/10/2026. O site agora tem login e guarda dados pessoais (nome e WhatsApp
de quem reserva). O que protege cada parte está documentado em
[apps/backend/docs/08-login-e-permissoes.md](apps/backend/docs/08-login-e-permissoes.md) (API) e
na seção "Login" de [apps/frontend/README.md](apps/frontend/README.md) (site e painel). Em resumo:
token de login num cookie que o JavaScript não lê, toda permissão conferida pela API, limites de
tentativas por visitante e cabeçalhos de segurança no site.

Pendências de configuração:

- **Produção:** HTTPS e HSTS no Nginx, que também precisa sobrescrever o `X-Forwarded-For` (veja
  "Riscos que continuam" no README do front). Troque o `JWT_SECRET`, o `FRONTEND_TOKEN` e a senha
  do admin do seed.
- **Proteção da `main`** no GitHub (**Settings → Branches**): exigir Pull Request com 1 revisão.
- **Dependabot alerts** e **Secret scanning** (**Settings → Code security**), gratuitos em
  repositórios públicos.
- **E-mail nos commits:** o repositório é público e os commits mostram o e-mail de quem os fez.
  Para esconder nos próximos, ative **Settings → Emails → "Keep my email addresses private"** no
  GitHub e configure no Git o e-mail `...@users.noreply.github.com` mostrado nessa página.
- **Nunca** coloque senhas, tokens ou chaves no código. Use os arquivos `.env`/`.env.local`, que
  não vão para o Git.
