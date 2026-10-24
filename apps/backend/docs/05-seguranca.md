# 05 — Segurança da API

> Revisão feita em 24/10/2026, olhando o código do backend.
> Resumo: **a base está protegida**, mas ainda **não está pronta para produção**. Falta principalmente **autenticação** e **proteção dos dados pessoais das reservas**.

---

## ✅ O que já está protegido

| Proteção | Como | Onde |
|---|---|---|
| **Validação de toda entrada** | Cada rota tem um DTO com regras (tipo, tamanho, formato). Dado inválido volta com 400 antes de chegar no service | `dto/*.dto.ts` + `ValidationPipe` em `main.ts` |
| **Campos extras recusados** | `whitelist` + `forbidNonWhitelisted`: ninguém consegue mandar `"status":"RETIRADA"` ao criar uma reserva | `main.ts` |
| **IDs validados** | `ParseIntPipe`: `/produtos/abc` volta 400, não chega no banco | controllers |
| **SQL Injection** | O Prisma monta as consultas com parâmetros, nunca concatenando texto. O único SQL manual (`SELECT 1` do health) usa template seguro | services, `app.controller.ts` |
| **Erros não vazam detalhes** | O `PrismaExceptionFilter` devolve mensagens genéricas (404/409/500), sem nome de tabela nem stack trace | `common/filters/` |
| **Segredos fora do Git** | `.env` está no `.gitignore`; só o `.env.example` (sem senhas reais) é versionado | `.gitignore` |
| **CORS restrito** | O navegador só deixa o endereço do front (`FRONTEND_URL`) chamar a API | `main.ts` |
| **Consentimento LGPD** | Reserva só é criada com `aceiteLgpd: true` | `create-reserva.dto.ts` |
| **Histórico preservado** | Reserva não tem DELETE, só muda de status | `reservas.controller.ts` |
| **Regras no servidor** | Esgotado, transições de status e expiração são checados no backend, não só na tela | `reservas.service.ts` |
| **Versões fixas** | Prisma fixado em versão estável exata, evitando instalar uma versão de teste por acidente | `package.json` |

---

## ⚠️ O que ainda falta (por prioridade)

### 🔴 Alta: resolver antes de ir para produção

**1. Não existe login (autenticação).**
Hoje **qualquer pessoa** que souber o endereço da API pode:
- criar, editar e apagar lojas, produtos e categorias;
- mudar o status de qualquer reserva (confirmar, cancelar).

O que fazer: login para os lojistas (ex: JWT com `@nestjs/jwt` + `@nestjs/passport`) e um **Guard** do Nest protegendo as rotas de escrita. As rotas de leitura do catálogo continuam públicas. Cada lojista só pode mexer na **própria** loja (autorização).

**2. Dados pessoais expostos em `GET /reservas`.**
A listagem de reservas é pública e mostra **nome e WhatsApp dos clientes**. Pela LGPD, isso é dado pessoal e só a loja da reserva deveria ver.

O que fazer: proteger `GET /reservas` e `GET /reservas/:id` com o mesmo login do item 1, filtrando pela loja do usuário logado.

### 🟠 Média

**3. Sem limite de requisições (rate limit).**
Um robô pode criar milhares de reservas falsas por minuto.
O que fazer: `@nestjs/throttler` (ex: no máximo 5 reservas por minuto por IP).

**4. Sem cabeçalhos de segurança HTTP.**
O que fazer: `helmet` no `main.ts`, que adiciona `X-Content-Type-Options`, `X-Frame-Options` etc. e esconde o `X-Powered-By: Express`. (O README do front tem a mesma pendência do lado dele.)

**5. Swagger aberto em produção.**
O `/docs` mostra todas as rotas para qualquer um. É ótimo em desenvolvimento, mas em produção deveria ser desligado ou protegido.
O que fazer: só ativar o Swagger quando `NODE_ENV !== 'production'`.

### 🟡 Baixa

**6. Senha do banco de desenvolvimento é simples** (`ache123`). Para desenvolvimento local é aceitável; **em produção, usar senha forte** guardada como segredo (GitHub Secrets, variáveis do servidor), nunca no código.

**7. Fotos de produto:** hoje são URLs. Quando houver upload, aceitar só JPG, PNG e WebP (SVG pode conter scripts), como o README do front já alerta.

**8. Retenção de dados (LGPD):** definir por quanto tempo guardar nome e WhatsApp de reservas antigas (ex: anonimizar depois de 90 dias).

**9. `npm audit` (rodado em 24/10/2026).** Resultado e o que fizemos:

| Pacote | Gravidade | O que era | O que fizemos |
|---|---|---|---|
| `@nestjs/mau` (+ `inquirer`, `tmp`, `undici`, `external-editor`) | alta/moderada/baixa | Ferramenta de deploy na nuvem do Nest, veio no projeto gerado e **não é usada** | **Removida**, junto com o script `deploy`. Sumiram 5 alertas |
| `multer` 2.4.0 (via `@nestjs/platform-express`) | alta | Permite derrubar o servidor (DoS) **durante upload de arquivo** | **Pendente.** A API não tem upload, então hoje não é explorável. O Nest fixa a versão exata 2.4.0; tentamos forçar a 2.5.0 com `overrides` do npm, mas ele não aplica em workspaces. Aguardar o Nest atualizar |

> ⚠️ **Não rode `npm audit fix --force`.** Ele "resolve" rebaixando o Nest para a versão 11 e quebra o projeto.

Os 4 alertas que sobram são todos a mesma falha do `multer`, contada em cada pacote que depende dele.

**10. HTTPS:** em produção, a API deve ficar atrás de um proxy (Nginx) com HTTPS. Isso é parte da infraestrutura (#8).

---

## Resumo para a apresentação

| | Situação |
|---|---|
| Validação de entrada | ✅ Feito |
| SQL Injection | ✅ Protegido (Prisma) |
| Segredos fora do Git | ✅ Feito |
| CORS | ✅ Restrito ao front |
| Consentimento LGPD | ✅ Obrigatório |
| Login / permissões | ❌ A fazer (prioridade alta) |
| Dados pessoais das reservas | ❌ Expostos, depende do login |
| Rate limit | ❌ A fazer |
| Cabeçalhos (helmet) | ❌ A fazer |
| Swagger em produção | ❌ A desligar |
| HTTPS | ⏳ Infra (#8) |
