# 04 — Integração com o monorepo do grupo

> **Branch:** `feat/backend` (criada a partir da `main` do GitHub)
> **Data:** 24/10/2026

## Contexto

Quando começamos as issues #5 e #11, o repositório do GitHub estava **vazio**. Criamos o backend numa pasta `backend/` na raiz, em branches locais (`feat/backend-init` e `feat/backend-modules`).

Enquanto isso, o grupo subiu o front e **reorganizou o repositório num monorepo**:

```
Ache-em-Petrolina/
├── apps/
│   ├── frontend/     ← Next.js (issues #4 e #9), feito pelo grupo
│   └── backend/      ← reservado para a API (só um .gitkeep)
├── packages/         ← código compartilhado (vazio por enquanto)
├── .github/workflows ← CI/CD (vazio por enquanto)
└── package.json      ← npm workspaces: um npm install na raiz instala tudo
```

**Monorepo** = um repositório só com vários apps. **npm workspaces** = o npm trata cada pasta de `apps/` como um pacote, instala todos de uma vez e usa um único `package-lock.json` na raiz.

---

## O que fizemos

### 1. Juntar as histórias do Git (rebase)

**Problema:** como começamos com o repo vazio, nossos commits não tinham **nenhum commit em comum** com a `main` do grupo. Eram duas histórias separadas, e um Pull Request assim fica confuso ou nem dá para abrir.

**Solução:** "replantar" nossos 3 commits em cima da `main`:

```bash
git fetch --all
git checkout -b feat/backend feat/backend-modules
git rebase --root --onto origin/main
```

- `--onto origin/main`: coloca nossos commits **depois** do último commit da `main`.
- `--root`: inclui desde o nosso primeiro commit.
- Não deu nenhum conflito, porque o grupo não tinha mexido nas pastas `backend/` e `docs/`.
- As branches antigas (`feat/backend-init` e `feat/backend-modules`) ficaram como **backup**.

```
ANTES                                   DEPOIS
main:  A ─ B ─ C ─ D                    main:         A ─ B ─ C ─ D
nosso: X ─ Y ─ Z   (sem ligação)        feat/backend:               └─ X' ─ Y' ─ Z' ─ W
```

### 2. Mover o backend para `apps/backend`

```bash
git rm apps/backend/.gitkeep
mv backend apps/backend
mv docs/backend/* apps/backend/docs/
```

O Git reconheceu os arquivos como **renomeados** (não apagados e recriados), então o histórico de cada arquivo foi preservado. A documentação passou a morar dentro do próprio app, em `apps/backend/docs/`.

### 3. Porta da API: 3000 → 3001

**Problema:** o Next.js e o NestJS usam a porta **3000** por padrão. Rodando os dois juntos, o segundo não sobe.

**Solução:** a API passou para a **3001** (`PORT=3001` no `.env` e o padrão em `main.ts`).

| Serviço | Porta |
|---|---|
| Front-end (Next.js) | 3000 |
| API (NestJS) | 3001 |
| PostgreSQL (Docker) | 5433 |

### 4. CORS restrito ao front

Antes, `app.enableCors()` liberava **qualquer site** para chamar a API pelo navegador. Agora libera só o endereço do front:

```ts
app.enableCors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
});
```

Em produção, basta trocar `FRONTEND_URL` no `.env` pelo domínio real.

### 5. Scripts do backend na raiz

Adicionamos ao `package.json` da raiz, **sem mexer nos scripts do front**:

| Comando (na raiz) | O que faz |
|---|---|
| `npm run dev:backend` | Sobe a API em modo desenvolvimento |
| `npm run build:backend` | Compila a API |
| `npm run test:backend` | Roda os testes da API |
| `npm run lint:backend` | Verifica o padrão do código |
| `npm run db:up` / `db:down` | Sobe / derruba o Postgres no Docker |

O `-w backend` nos scripts significa "rode isso no workspace chamado backend" (o `name` do `apps/backend/package.json`).

### 6. `package-lock.json` do app removido

Em workspaces, só existe **um** lock: o da raiz. O `apps/backend/package-lock.json` foi removido.

> ⚠️ **Pendente:** rodar `npm install` na raiz para o lock da raiz passar a incluir as dependências do backend. Sem isso, `npm ci` (usado no CI) falha.

### 7. Limpeza

Um arquivo de cache do TypeScript (`tsconfig.build.tsbuildinfo`) tinha entrado no Git por engano. O `.gitignore` da raiz já ignora `*.tsbuildinfo`, então ele saiu do repositório.

---

## O que o nosso Pull Request muda

Comparando `feat/backend` com a `main`:

| Caminho | Mudança |
|---|---|
| `apps/backend/**` | Todo o backend (novo) |
| `package.json` (raiz) | Só **adicionados** os scripts do backend |
| `apps/frontend/**` | **Nada.** O front não foi tocado |

## Como o backend chega na `main`

```
feat/backend ──push──▶ GitHub ──Pull Request──▶ revisão (1 pessoa) ──merge──▶ main
```

Regras do grupo (README da raiz): branch a partir da `main`, PR com pelo menos 1 revisão, `Closes #5` e `Closes #11` na descrição, e `format`, `lint` e `build` passando antes.

> ❓ **A combinar:** o GitHub marca a `develop` como branch padrão, mas ela só tem o commit inicial, e o README diz para trabalhar a partir da `main`. Confirmar com o grupo para onde vai o PR.

## Checklist antes do push

- [ ] `npm install` na raiz (atualiza o `package-lock.json`)
- [ ] `npm run build:backend`, `npm run lint:backend`, `npm run test:backend`
- [ ] `npm run build` e `npm run lint` (front, para garantir que nada quebrou)
- [ ] Commit do lock atualizado
- [ ] Push da `feat/backend` e abertura do PR
