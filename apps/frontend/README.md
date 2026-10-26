# Ache em Petrolina — Front-end

Aplicação Next.js (issue #4) com a interface web mobile-first do Ache em Petrolina, em
**Next.js 16 + TypeScript + Tailwind CSS 4**. Tem o site público (catálogo e busca, issue #9;
reserva, issue #10; página da loja) e o painel dos lojistas e do admin em `/painel`, todos ligados
na API de `apps/backend`.

## Como rodar

Requer **Node.js 20.9 ou mais novo** (veja o `.nvmrc` na raiz). Este app faz parte dos npm
workspaces do repositório: rode `npm install` na **raiz**. Os outros comandos funcionam tanto
nesta pasta quanto na raiz.

Os dados vêm da API (`apps/backend`), então **suba o banco e a API antes** do `npm run dev` e do
`npm run build` (o build gera as páginas com os dados da API). Na raiz: `npm run db:up`,
`npm run db:seed` e `npm run dev:backend`; os detalhes estão no README do backend.

```bash
npm install           # na raiz do repositório
cp .env.example .env.local
npm run dev           # http://localhost:3000
npm run build         # build de produção (o CI deve rodar este comando)
npm run lint          # ESLint (regras do Next.js)
npm run format        # formata tudo com o Prettier
npm run format:check  # só verifica a formatação (para o CI)
```

No **Prompt de Comando (cmd)** do Windows, troque o `cp` por `copy .env.example .env.local`. No
PowerShell e no Git Bash o `cp` funciona.

## Variáveis de ambiente

| Variável               | Para que serve                                                               | Padrão                  |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SITE_URL` | Endereço público do site, usado nos links canônicos e no SEO. Sem `/` no fim | `http://localhost:3000` |
| `API_URL`              | Endereço da API. Só o servidor do Next usa, não vai para o navegador         | `http://localhost:3001` |
| `FRONTEND_TOKEN`       | Mesmo valor do `FRONTEND_TOKEN` da API. Ver abaixo                           | vazio                   |

Em produção, use o domínio real (ex.: `https://acheempetrolina.com`). Arquivos `.env*` não vão
para o Git, exceto o `.env.example`.

## Padronização de código

- **ESLint** (`eslint.config.mjs`): regras do Next.js para React, TypeScript e Core Web Vitals.
  O `eslint-config-prettier` desliga as regras de estilo que brigariam com o Prettier.
- **Prettier** (`.prettierrc.json`): linhas de até 100 colunas, aspas duplas e ponto e vírgula.
  O plugin `prettier-plugin-tailwindcss` ordena as classes do Tailwind automaticamente.
- No VS Code, instale as extensões ESLint e Prettier e ative "Format On Save".
- Rode `npm run format` antes de abrir um Pull Request.

## Páginas

**Site (público)**

| Rota                                            | O que tem                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                             | Atalhos "Mais buscados", categorias, bairros com lojas, destaques e "Como funciona"                                                     |
| `/busca?q=&categoria=&bairro=&estoque=1&ordem=` | Resultados com filtros por categoria, bairro, "só com estoque" e ordenação por preço                                                    |
| `/produto/[slug]`                               | Fotos, preço, estoque, loja, horário/"aberto agora", **Reservar**, WhatsApp, Ligar e Como chegar                                        |
| `/produto/[slug]/reservar`                      | Reserva sem pagar online: nome, WhatsApp, quantidade e aceite LGPD. Depois mostra o nº da reserva, o prazo e o botão para avisar a loja |
| `/loja/[slug]`                                  | Página da loja: contato, endereço, horários e todos os produtos                                                                         |
| `/status`                                       | Health check: o site, a API e o banco estão no ar?                                                                                      |
| `/entrar`, `/esqueci-senha`, `/redefinir-senha` | Login e recuperação de senha (link "Área do lojista" no rodapé)                                                                         |

**Painel (`/painel`, só com login)**

| Rota                                    | Quem vê | O que faz                                                                                         |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `/painel`                               | todos   | Resumo: reservas novas, aguardando retirada, produtos (e lojas/usuários para o admin)             |
| `/painel/reservas`                      | todos   | Reservas por situação; WhatsApp do cliente; **Confirmar**, **Marcar como retirada**, **Cancelar** |
| `/painel/produtos` (`/novo`, `/[id]`)   | todos   | Cadastrar, editar, mudar o estoque e remover produtos                                             |
| `/painel/loja`                          | lojista | Dados da própria loja: contato, endereço e horário de funcionamento                               |
| `/painel/lojas` (`/nova`, `/[id]`)      | admin   | Cadastrar, editar e remover lojas (inclusive nota e avaliações)                                   |
| `/painel/usuarios`                      | admin   | Criar acessos (lojista de uma loja ou admin) e remover                                            |
| `/painel/categorias`, `/painel/bairros` | admin   | Criar, renomear e remover                                                                         |
| `/painel/conta`                         | todos   | Dados da conta e **trocar senha**                                                                 |

O lojista vê só a própria loja. O admin vê tudo e pode filtrar produtos e reservas por loja.

A busca por termo fica em `/busca`, aberta pelo botão **Buscar** no topo de todas as páginas.
Ela ignora acentos e plural simples (`tenis nike 42` encontra "Tênis Nike Revolution 7").
Os filtros ficam na URL, então os links podem ser compartilhados e funcionam sem JavaScript.

## Estrutura

```
src/
  app/                   rotas (App Router); app/painel/ é a área logada
  components/            componentes do site (cards, galeria, formulários de conta e de reserva)
  components/dashboard/  componentes do painel (menu, formulários de produto/loja/usuário...)
  lib/
    types.ts             formato dos dados que as telas usam (em inglês)
    api.ts               cliente HTTP da API (só no servidor)
    mappers.ts           conversão API (português) <-> front (inglês)
    catalog.ts           leituras públicas do catálogo, com cache
    reservations.ts      reserva feita pelo cliente
    system.ts            saúde da API e do banco (/status)
    session.ts           cookie da sessão
    auth.ts              login, recuperação de senha, sessão atual e requireSession()
    dashboard/           leituras e alterações do painel, uma por área (products, reservations,
                         stores, users, taxonomy). Sem cache: quem edita vê o dado atual
    actions/             Server Actions dos formulários ("use server"), uma por área
    form.ts              leitura dos campos dos formulários e mensagens de erro da API
    notices.ts           avisos do painel (?aviso=salvo)
    format.ts            preço, datas, horários, links de WhatsApp/telefone/mapa
    search-params.ts     leitura/escrita dos filtros na URL
scripts/                 gera as ilustrações de public/mock (npm run mock:images)
```

Por que `dashboard/` e `actions/` são separados: **toda função exportada de um arquivo
`"use server"` vira um endpoint** que qualquer um pode chamar. Por isso os arquivos de `actions/`
só têm as actions dos formulários (cada uma confere a sessão com `requireSession()` antes de tudo),
e as funções que falam com a API ficam em `dashboard/`, marcadas com `import "server-only"`.

## Ligação com a API

O front usa **todas as rotas da API** (lista completa em `apps/backend/README.md`):

| Rota da API                                                                                                       | Onde o front usa                                              |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `GET /produtos` (filtros), `GET /produtos/slug/:slug`, `GET /categorias`, `GET /bairros`                          | `lib/catalog.ts`: home, busca, produto                        |
| `GET /lojas`, `GET /lojas/slug/:slug`                                                                             | `lib/catalog.ts` (página da loja) e `lib/dashboard/stores.ts` |
| `GET /produtos/:id`, `POST`, `PATCH`, `DELETE /produtos`, `PATCH /produtos/:id/estoque`                           | `lib/dashboard/products.ts`                                   |
| `POST /reservas`                                                                                                  | `lib/reservations.ts` (público)                               |
| `GET /reservas`, `PATCH /reservas/:id/status`                                                                     | `lib/dashboard/reservations.ts`                               |
| `GET /lojas/:id`, `POST`, `PATCH`, `DELETE /lojas`                                                                | `lib/dashboard/stores.ts`                                     |
| `GET`, `POST`, `DELETE /usuarios`                                                                                 | `lib/dashboard/users.ts`                                      |
| `POST`, `PATCH`, `DELETE /categorias` e `/bairros`                                                                | `lib/dashboard/taxonomy.ts`                                   |
| `POST /auth/login`, `GET /auth/me`, `PATCH /auth/senha`, `POST /auth/esqueci-senha`, `POST /auth/redefinir-senha` | `lib/auth.ts`                                                 |
| `GET /health`                                                                                                     | `lib/system.ts` (página `/status`)                            |

- **Nomes:** a API usa português e o front inglês. A conversão fica toda em `lib/mappers.ts`
  (`preco` em texto vira número, `DISPONIVEL` vira `disponivel`, os `horarios` viram o array
  `hours` de 7 posições etc.). As telas usam só os tipos de `lib/types.ts`.
- **Cache:** as leituras públicas têm `"use cache"` + `cacheLife` (`minutes` para produtos e lojas,
  `hours` para categorias e bairros) e a tag `catalogo`. Toda alteração feita no painel chama
  `updateTag("catalogo")`, então o site mostra a mudança **na hora**. O painel não usa cache.
- **Limite de requisições:** a API aceita 100 requisições por minuto por IP, e todas as visitas
  chegam nela pelo IP do servidor do Next. Por isso `lib/api.ts` manda o `FRONTEND_TOKEN` no
  cabeçalho `x-frontend-token` (as leituras ficam fora do limite) e, no login e na reserva, o IP
  do visitante no `x-cliente-ip` (os limites de 5 logins e 10 reservas por minuto valem por pessoa).
- **Erros:** os erros de validação da API (400/409) aparecem no formulário, em português; 403 vira
  "Você não tem permissão". Se a API cair, `app/error.tsx` (site) e `app/painel/error.tsx`
  (painel) mostram uma mensagem com "Tentar de novo".
- **Fotos:** links `https://...` funcionam direto (vão como `unoptimized` no `<Image>`); caminhos
  que começam com `/` (ex.: `/mock/calcados-1.svg`) são servidos pelo próprio site.
- **Dados de exemplo:** ficam só no seed da API (`apps/backend/prisma/seed-data`). A antiga pasta
  `src/data` do front foi apagada em 26/10/2026.

## Painel

- **Permissões:** cada página e cada action chamam `requireSession()` (`lib/auth.ts`). Sem login,
  vai para `/entrar`; página de admin aberta por um lojista dá "não encontrado". Isso organiza as
  telas, mas **quem garante a permissão é a API**, em toda chamada (ela confere o token e a loja).
  Testado: um lojista que forja o id de um produto de outra loja recebe "Você não tem permissão".
- **Formulários grandes** (produto, loja, usuário) usam `useActionState`: depois de um erro, voltam
  com o que foi digitado (menos senhas). As ações rápidas das listas (estoque, status da reserva,
  remover) voltam para a lista com um aviso (`?aviso=salvo`); o texto do aviso vem de
  `lib/notices.ts`, nunca da URL.
- **Remover** pede confirmação. Remover uma loja apaga também os produtos, as reservas e os
  lojistas dela (regra da API).
- **Suspense em cada página:** as páginas do painel são exportadas com `suspended(...)`
  (`components/dashboard/suspended.tsx`). Com Cache Components, a leitura da sessão precisa de um
  `<Suspense>` da própria página: ao navegar entre páginas do painel, o do layout não aparece de
  novo.
- **JavaScript:** o site público funciona sem JavaScript (busca, reserva, login). No painel, um
  formulário enviado **sem** JavaScript que volta com erro mostra só o esqueleto da página (o Next
  manda o conteúdo para o navegador montar). Com JavaScript, que é o normal, funciona por completo.
- **Destaque na home:** o formulário de produto deixa o lojista marcar "Mostrar nos destaques"
  porque a API permite. Se o grupo quiser que só o admin escolha os destaques, a regra precisa
  entrar na API.

## Login (`/entrar` e `/painel`)

As contas são as da API (`POST /auth/login`): o admin e os lojistas criados pelo seed. Em
desenvolvimento, o lojista de exemplo de cada loja é `<slug-da-loja>@lojista.local`, com a senha
`SEED_SENHA_LOJISTA` do `.env` da API.

Como funciona:

1. O formulário (`src/components/login-form.tsx`) chama a Server Action `loginAction`
   (`src/lib/actions/auth.ts`), que roda no servidor do Next. Funciona até sem JavaScript.
2. A action valida os campos e chama a API, repassando o IP do visitante (veja abaixo).
3. O token (JWT) que a API devolve vai para o cookie `ache_sessao`, e o usuário vai para `/painel`.
4. O `/painel` lê o cookie e pergunta à API quem é o usuário (`GET /auth/me`). Quem confere o token
   é sempre a API: o front não tem o `JWT_SECRET`.
5. **Sair** apaga o cookie.

Esqueci minha senha:

1. Em `/esqueci-senha`, a pessoa digita o e-mail e a API (`POST /auth/esqueci-senha`) manda um
   link `/redefinir-senha?token=...`, que vale 30 minutos e só funciona uma vez. Em
   desenvolvimento a API não envia e-mail: o link aparece no **log da API**.
2. Em `/redefinir-senha`, a pessoa escolhe a senha nova (8 a 72 caracteres, repetida duas vezes) e
   a API (`POST /auth/redefinir-senha`) confere o código e troca a senha.

Segurança (revisada em 26/10/2026):

| Cuidado                                                                                                                                                                                                                        | Onde                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Token num cookie `HttpOnly` (o JavaScript da página não lê), `SameSite=lax`, `Secure` em produção e validade igual à do token                                                                                                  | `src/lib/session.ts`                                   |
| Token e senha só no servidor do Next (`import "server-only"`); a senha não é guardada nem registrada em log                                                                                                                    | `src/lib/auth.ts`, `src/lib/actions/auth.ts`           |
| Mesma mensagem para e-mail inexistente e senha errada (não revela quem tem conta)                                                                                                                                              | `src/lib/actions/auth.ts` e a API                      |
| 5 tentativas por minuto **por visitante**: o Next repassa o IP no `x-cliente-ip`, aceito pela API só com o `FRONTEND_TOKEN`                                                                                                    | `src/lib/auth.ts` e `apps/backend/src/common/throttle` |
| Formulários só aceitam envios do próprio site (o Next compara `Origin` e `Host` nas Server Actions: proteção contra CSRF)                                                                                                      | nativo do Next                                         |
| Depois do login o destino é fixo (`/painel`): não existe `?voltar=` para virar redirecionamento para outro site                                                                                                                | `src/lib/actions/auth.ts`                              |
| Recuperação de senha: a tela responde igual exista ou não a conta; o código do link é conferido só pela API e não vai para nenhum log; a página usa `referrer: same-origin`, então nenhum outro site recebe a URL com o código | `src/lib/auth.ts`, `src/app/redefinir-senha`           |
| `/entrar`, `/painel`, `/esqueci-senha` e `/redefinir-senha` com `noindex`; o site não pode ser aberto dentro de `<iframe>` (clickjacking)                                                                                      | páginas e `next.config.ts`                             |

Riscos que continuam (para o deploy):

- **IP do visitante em produção:** o Next lê o último endereço do `X-Forwarded-For`. Coloque o site
  atrás do Nginx com `proxy_set_header X-Forwarded-For $remote_addr;` (sobrescreve o cabeçalho). Se o
  Next ficar exposto direto, um atacante pode inventar esse cabeçalho e fugir do limite de tentativas.
- **Sair não invalida o token na API:** apaga o cookie, mas um token copiado continua valendo até
  expirar (`JWT_EXPIRA_EM`, 1 dia). Para encurtar o risco, diminua a validade.
- **E-mail de verdade:** a API ainda só escreve o e-mail no log. Para produção, ligue um provedor
  (SMTP, Resend, SES...) em `apps/backend/src/email/email.service.ts`.
- **Referrer da página de redefinir senha:** não troque `same-origin` por `no-referrer`. Com ele, o
  navegador manda `Origin: null` no envio sem JavaScript e o Next recusa o formulário.

## Decisões

- **Busca fora da tela inicial.** A home tinha um campo de busca grande, removido no commit
  "refactor(frontend): remove o buscador grande da tela inicial". A busca por termo continua em `/busca`, pelo botão **Buscar** do topo, e a home mantém
  os atalhos "Mais buscados", as categorias e os bairros. A issue #9 pede "tela inicial com busca
  por termo": se a revisão pedir o campo na home de novo, o componente `SearchForm` já existe e
  basta usá-lo em `src/app/page.tsx`.
- **Dados fictícios.** Lojas, produtos e endereços do seed da API são inventados. Os números de
  WhatsApp usam o prefixo `9 0000`, que não existe em celulares, para ninguém receber mensagens
  por engano. Os nomes de bairros são de Petrolina; confira se falta algum.
- **Fotos ilustrativas.** `npm run mock:images` gera 3 ilustrações por categoria em `public/mock`.
  Fotos com link de outro site não passam pelo otimizador do Next (`isExternalImage` em
  `lib/format.ts`): liberar todos os domínios em `images.remotePatterns` faria o servidor servir de
  proxy para qualquer site.
- **Filtros na URL.** Os parâmetros são `q`, `categoria`, `bairro`, `estoque=1` e
  `ordem=menor-preco|maior-preco`. Valores vazios ficam fora da URL (`buildSearchHref`). O
  formulário de busca é recriado (via `key`) quando a URL muda, para os campos mostrarem os
  filtros atuais.
- **Busca.** Ignora acentos e maiúsculas, palavras como "de" e "para" e o plural simples.
  Todos os termos precisam aparecer; termos no nome ou na marca valem mais. Esgotados aparecem
  por último. Tudo isso é feito na API (`apps/backend/src/produtos/busca.ts`).
- **"Aberto agora".** Depende do relógio, então é calculado no navegador
  (`src/components/open-status.tsx`), no fuso `America/Recife`. No servidor o componente não
  mostra nada. Os horários de cada loja ficam em `hours`, com o índice `0` = domingo.
- **Cache Components** (`cacheComponents: true` no `next.config.ts`):
  - `/busca` envia o topo da página na hora e os resultados chegam depois, dentro de um
    `<Suspense>`, porque dependem da URL.
  - As páginas de produto, de reserva e de loja são geradas no build (`generateStaticParams`,
    com os slugs da API) e `loading.tsx` aparece na navegação entre elas.
  - Um produto inexistente mostra a página "não encontrado" com status **200** e
    `noindex`, não 404: com Cache Components a opção `dynamicParams` não existe.
- **Preços** são números em reais (`399.9`). A API manda o `Decimal` como texto (`"399.9"`) e
  `src/lib/mappers.ts` converte com `Number(...)`. No painel, o preço pode ser digitado como
  `1.299,90`, `1299,90` ou `1299.90`.

## Pendências

- **Cabeçalhos de segurança HTTP:** `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy` e `Permissions-Policy` já estão no `next.config.ts`. Falta uma
  `Content-Security-Policy` completa, que pode vir junto com o Nginx. HSTS e HTTPS ficam no Nginx,
  em produção.
- **Envio de fotos:** hoje o lojista cola o link da foto. Um upload de verdade (com storage)
  precisa aceitar só JPG, PNG ou WebP: SVG pode conter scripts.
- **SEO local:** a página da loja (`/loja/[slug]`) existe; páginas próprias por categoria e
  bairro (ex.: `/bairro/centro`) ainda não.
- **`npm audit`** aponta 5 alertas "high" no `eslint-config-next` (ferramenta de lint, não vai para
  o site). Não rode `npm audit fix --force`: ele rebaixa o pacote para a versão 14. Aguarde uma
  atualização do Next.
