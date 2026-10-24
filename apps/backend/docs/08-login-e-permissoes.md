# 08 — Login (JWT) e permissões

> **Data:** 24/10/2026 · direto na `main`
> Resolve os itens 🔴 de prioridade alta do [doc 05 — Segurança](05-seguranca.md): **não havia login** e **os dados pessoais das reservas eram públicos**.

## O problema

Até aqui, **qualquer pessoa** que soubesse o endereço da API podia:
- criar, editar e apagar lojas, produtos, bairros e categorias;
- ver **nome e WhatsApp de todos os clientes** em `GET /reservas` (dado pessoal, LGPD);
- confirmar ou cancelar reservas de qualquer loja.

---

## Conceitos

### Autenticação × autorização
| | Pergunta | Resposta errada | No nosso código |
|---|---|---|---|
| **Autenticação** | *Quem é você?* | **401** Unauthorized | `JwtAuthGuard` confere o token |
| **Autorização** | *Você pode fazer isso?* | **403** Forbidden | `PapeisGuard` (papel) e `garantirAcessoALoja` (dono) |

### O que é JWT
**JSON Web Token**: um "crachá" que a API entrega no login. Tem 3 partes separadas por ponto: `cabeçalho.conteúdo.assinatura`.

```json
{ "sub": 2, "papel": "LOJISTA", "lojaId": 1, "iat": 1792855000, "exp": 1792941400 }
```

- O **conteúdo** diz quem é o usuário, o papel e a loja dele. Não é segredo: qualquer um consegue ler (por isso **nunca** colocamos senha nem dado sensível dentro).
- A **assinatura** é feita com o `JWT_SECRET`, que só a API conhece. Se alguém alterar o conteúdo (ex: trocar `lojaId: 1` por `lojaId: 2`), a assinatura não bate e a API recusa.
- **Expira** (`exp`): por padrão em 1 dia (`JWT_EXPIRA_EM`). Depois disso, precisa logar de novo.
- É **stateless**: a API não guarda sessão; cada requisição traz o crachá e a API só confere a assinatura.

### Por que bcrypt para senha
A senha **nunca** é guardada. Guardamos um **hash**: uma "impressão digital" de mão única (não dá para voltar do hash para a senha). O bcrypt:
- é **lento de propósito** (custo 10 ≈ 1.024 rodadas), o que atrapalha quem tenta adivinhar milhões de senhas;
- usa **salt** (um valor aleatório por senha): duas pessoas com a mesma senha têm hashes diferentes.

No login, o bcrypt calcula o hash da senha digitada e compara com o guardado.

---

## O fluxo

```
1. POST /auth/login { email, senha }
      └─ API confere a senha com bcrypt
      └─ devolve { accessToken: "eyJhbGci...", usuario: {...} }

2. Front guarda o token e manda em toda requisição de gestão:
      Authorization: Bearer eyJhbGci...

3. Em CADA requisição, 3 guards globais rodam em ordem:
      ThrottlerGuard → limite de requisições por IP   (429 se passar)
      JwtAuthGuard   → tem token válido?              (401 se não)
      PapeisGuard    → o papel pode usar esta rota?   (403 se não)

4. No service, garantirAcessoALoja confere se o recurso é da loja do usuário (403 se não)
```

---

## Papéis e permissões

| Papel | Quem é | O que pode |
|---|---|---|
| **ADMIN** | Equipe do Ache em Petrolina | Tudo: bairros, categorias, lojas, usuários, todas as reservas |
| **LOJISTA** | Dono/funcionário de **uma** loja | Só a **própria** loja: editar dados, CRUD dos produtos, estoque, ver e mudar status das reservas |
| *(sem login)* | Cliente no site | Ver o catálogo e **criar reserva** |

### Matriz de rotas

| Rota | Sem login | Lojista | Admin |
|---|---|---|---|
| `GET /health`, `GET /` | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ (5/min) | ✅ | ✅ |
| `POST /auth/esqueci-senha` · `POST /auth/redefinir-senha` | ✅ (3/min · 5/min) | ✅ | ✅ |
| `GET /auth/me`, `PATCH /auth/senha` | ❌ | ✅ | ✅ |
| `GET /bairros`, `/categorias`, `/lojas`, `/produtos` (e por id/slug) | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /bairros`, `/categorias` | ❌ | ❌ | ✅ |
| `POST /lojas`, `DELETE /lojas/:id` | ❌ | ❌ | ✅ |
| `PATCH /lojas/:id` | ❌ | **só a dele** (sem mexer em nota/avaliações) | ✅ |
| `POST /produtos`, `PATCH /produtos/:id`, `PATCH /produtos/:id/estoque`, `DELETE /produtos/:id` | ❌ | **só da loja dele** | ✅ |
| `POST /reservas` | ✅ (10/min) | ✅ | ✅ |
| `GET /reservas` | ❌ | **só as da loja dele** (mesmo pedindo `?lojaId=` de outra) | ✅ todas |
| `GET /reservas/:id`, `PATCH /reservas/:id/status` | ❌ | **só da loja dele** | ✅ |
| `/usuarios` (criar, listar, apagar) | ❌ | ❌ | ✅ |

### Seguro por padrão
O `JwtAuthGuard` é **global**: toda rota exige login, a não ser que tenha `@Publico()`. Se alguém criar uma rota nova e esquecer de pensar em segurança, ela nasce **fechada**, e não aberta.

---

## Proteções extras

| Proteção | Onde | Por quê |
|---|---|---|
| **Mesma mensagem** para e-mail inexistente e senha errada | `auth.service.ts` | Não deixa descobrir quais e-mails estão cadastrados |
| **Mesmo tempo** de resposta nos dois casos | `HASH_FALSO` em `senha.ts` | Mesmo motivo, medindo o tempo da resposta |
| **5 tentativas de login por minuto** por IP | `@Throttle` no login | Atrapalha força bruta (tentar milhares de senhas) |
| **10 reservas por minuto** por IP | `@Throttle` em `POST /reservas` | Atrapalha robôs criando reservas falsas |
| **100 requisições por minuto** por IP no geral | `ThrottlerModule` | Limite básico contra abuso |
| `senhaHash` **nunca sai do banco** | `omit` no `PrismaService` | Mesmo que alguém esqueça, a senha não vaza numa resposta |
| `JWT_SECRET` com **32+ caracteres**, senão a API **nem sobe** | `auth.module.ts` | Segredo curto pode ser descoberto |
| Em produção, recusa o segredo de exemplo do `.env.example` | `auth.module.ts` | Evita subir com um segredo que está no GitHub |
| Lojista não "move" produto para outra loja | `produtos.service.ts` | Senão daria para criar produto na própria loja e transferir |
| Lojista não altera a nota da própria loja | `lojas.service.ts` | A nota não é ele quem define |
| E-mail sempre em minúsculas | `auth` e `usuarios` | `Ana@x.com` e `ana@x.com` são a mesma pessoa |
| Swagger desligado em produção | `main.ts` | Não expõe o mapa da API |
| **Cabeçalhos de segurança** (`helmet`) | `main.ts` | Esconde o `X-Powered-By: Express`, impede abrir a API num `<iframe>` (`X-Frame-Options`), proíbe o navegador de "adivinhar" o tipo do arquivo (`nosniff`), força HTTPS em produção (`Strict-Transport-Security`). A `Content-Security-Policy` só liga em produção, porque a página do Swagger (que só existe em dev) usa scripts que ela bloquearia |

---

## Arquivos novos

```
src/auth/
├── auth.module.ts          # configura o JWT (segredo, validade)
├── auth.controller.ts      # POST /auth/login, GET /auth/me, PATCH /auth/senha
├── auth.service.ts         # confere senha, gera token, troca senha
├── auth.service.spec.ts    # testes do login e do garantirAcessoALoja
├── senha.ts                # bcrypt: gerar hash e conferir
├── usuario-logado.ts       # tipo do usuário no token + garantirAcessoALoja()
├── decorators.ts           # @Publico(), @Papeis(...), @UsuarioAtual()
├── dto/login.dto.ts
├── dto/trocar-senha.dto.ts
└── guards/
    ├── jwt-auth.guard.ts   # 401: confere o token
    ├── papeis.guard.ts     # 403: confere o papel
    └── guards.spec.ts      # testes dos dois guards
src/usuarios/               # só ADMIN: cadastra lojistas e admins
src/email/                  # EmailService: por enquanto escreve no log
prisma/migrations/20261024210000_redefinicao_de_senha/
prisma/migrations/20261024190000_usuarios_e_login/
```

Banco: tabela **`usuarios`** (nome, email único, senhaHash, papel ADMIN/LOJISTA, lojaId) e **`tokens_redefinicao_senha`** (hash do código, validade, quando foi usado).

---

## Como usar

### Variáveis de ambiente (`.env`)
| Variável | Exemplo | Para quê |
|---|---|---|
| `JWT_SECRET` | 64 caracteres aleatórios | Assina os tokens. **Nunca** vai pro Git |
| `JWT_EXPIRA_EM` | `1d` | Validade do token (`1h`, `8h`, `1d`) |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | `admin@ache.local` | Admin criado pelo seed |
| `SEED_SENHA_LOJISTA` | `lojista-dev-123` | Senha dos lojistas de exemplo (só desenvolvimento) |

Gerar um segredo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### Usuários de exemplo (depois do `npm run db:seed`)
- **Admin:** o `ADMIN_EMAIL` e a `ADMIN_SENHA` do seu `.env`
- **Lojistas:** um por loja, `<slug-da-loja>@lojista.local`, senha `SEED_SENHA_LOJISTA`. Ex: `passo-certo-calcados@lojista.local`

### No Swagger
1. Abra `http://localhost:3001/docs`
2. `POST /auth/login` → *Try it out* → e-mail e senha → copie o `accessToken`
3. Clique em **Authorize** (cadeado no topo), cole o token
4. Agora as rotas protegidas funcionam

### Para o front
- Telas públicas (catálogo, produto, reserva) **não mudam**: continuam sem login.
- A área do lojista (a criar) faz `POST /auth/login`, guarda o `accessToken` e manda `Authorization: Bearer <token>` nas chamadas de gestão.
- 401 = token ausente ou vencido → mandar para a tela de login.

---

## Testes

**Unitários** (21 novos, total 44):
- Guards: rota pública passa sem token; protegida sem token = 401; token falso = 401; token válido coloca o usuário na requisição; papel errado = 403.
- Login: senha certa gera token com id/papel/loja e sem `senhaHash`; senha errada = 401; e-mail inexistente = **mesma mensagem**; e-mail em minúsculas.
- Dono da loja: admin acessa qualquer uma; lojista só a dele.
- Reservas: lojista não lista nem mexe em reserva de outra loja, mesmo pedindo `?lojaId=` de outra.
- Esqueci a senha: só o hash vai pro banco; e-mail inexistente não envia nada; código inválido/vencido/usado = 400; código válido troca a senha e marca como usado.

**Manuais** (API rodando com o seed): todas as linhas da matriz de rotas acima, incluindo o bloqueio de 5 logins por minuto (429); os cabeçalhos do helmet; e o fluxo completo do "esqueci minha senha" (link no log, troca, senha antiga recusada, link reutilizado recusado).

---

## Esqueci minha senha

```
1. POST /auth/esqueci-senha { email }
     └─ se o e-mail existe: gera um código aleatório (32 bytes), guarda só o HASH
        (SHA-256) com validade de 30 min e "envia" o link por e-mail
     └─ responde SEMPRE a mesma mensagem (não revela quem tem conta)

2. Usuário abre o link:  <FRONTEND_URL>/redefinir-senha?token=<código>
     (a página do front ainda precisa ser criada)

3. POST /auth/redefinir-senha { token, novaSenha }
     └─ procura o hash do código, ainda não usado e dentro da validade
     └─ troca a senha E marca o código como usado, juntos (transação)
```

| Proteção | Por quê |
|---|---|
| Mesma resposta para e-mail existente e inexistente | Não revela quem tem conta |
| Só o **hash** do código vai pro banco | Quem ler o banco (vazamento, backup) não consegue usar o código |
| Validade de **30 minutos** e **uso único** | Um link antigo esquecido no e-mail não serve mais |
| Pedir um link novo cancela os anteriores | Só o último link vale |
| **3 pedidos por minuto** por IP | Não deixa usar a API para mandar spam de e-mail |
| Troca de senha + marcar como usado numa **transação** | Ou as duas coisas acontecem, ou nenhuma |

**E-mail:** o projeto ainda não tem um serviço de e-mail. O `EmailService` (`src/email/`) por enquanto **escreve o e-mail no terminal da API**. Para enviar de verdade, só o corpo de `enviar()` muda (SMTP com nodemailer, Resend, Amazon SES...), com as credenciais no `.env`.

---

## O que ainda falta (próximos passos de segurança)

| Item | Prioridade |
|---|---|
| Tela de login e área do lojista no **front** | Alta (combinar com o grupo) |
| ~~Cabeçalhos de segurança (`helmet`)~~ | ✅ Feito |
| ~~"Esqueci minha senha"~~ | ✅ Feito (falta só ligar um provedor de e-mail de verdade) |
| Provedor de e-mail real (SMTP, Resend, SES) no `EmailService` | Média |
| Página `/redefinir-senha` no **front** (o link do e-mail aponta pra ela) | Média |
| Revogar token antes de expirar (ex: lista de tokens bloqueados ou token curto + refresh token) | Baixa no MVP |
| Bloquear a conta depois de muitas tentativas erradas (hoje o limite é por IP) | Baixa |
| HTTPS na frente da API (Nginx, issue #8) | Alta em produção |
