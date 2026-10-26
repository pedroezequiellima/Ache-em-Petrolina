# 03 — Entendendo os módulos (guia de estudo)

> Atualizado em 24/10: depois deste guia entraram `bairros/` (doc 07) e o login com `auth/` e `usuarios/` (doc 08). A estrutura de cada módulo é a mesma explicada aqui.

> Explica **cada pasta e cada arquivo** do backend e **por que** existem.
> Todos os exemplos são do código real do projeto.

---

## 1. A ideia central: separar responsabilidades

Imagina que a API inteira fosse **um arquivo só**: rotas, validação, regras e SQL tudo misturado. Funciona no começo, mas:
- com 4 pessoas mexendo, todo mundo edita o mesmo arquivo e dá conflito no Git;
- para mudar uma regra (ex: prazo da reserva), você precisa caçar no meio de tudo;
- não dá pra testar uma regra sem subir o servidor e o banco.

O NestJS resolve isso com **um padrão fixo**: cada assunto do sistema vira um **módulo**, e dentro dele cada arquivo tem **uma única função**.

### Analogia do restaurante 🍽️

| No restaurante | No código | Arquivo |
|---|---|---|
| Uma seção da cozinha (ex: confeitaria) | **Module** | `produtos.module.ts` |
| O garçom: anota o pedido e entrega o prato | **Controller** | `produtos.controller.ts` |
| O cardápio: só pode pedir o que está nele | **DTO** | `dto/create-produto.dto.ts` |
| O cozinheiro: sabe a receita e faz o prato | **Service** | `produtos.service.ts` |
| A despensa: onde ficam os ingredientes | **Prisma + banco** | `prisma/prisma.service.ts` |

O garçom **não cozinha**. O cozinheiro **não atende cliente**. Cada um faz uma coisa, e faz bem.

---

## 2. O mapa das pastas

```
apps/backend/
├── prisma/                     ← BANCO DE DADOS (definição)
│   ├── schema.prisma
│   └── migrations/
├── src/                        ← CÓDIGO DA API
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── common/                 ← coisas compartilhadas
│   │   ├── filters/
│   │   ├── utils/
│   │   └── validators/
│   ├── prisma/                 ← CONEXÃO com o banco
│   ├── generated/prisma/       ← código gerado automaticamente
│   ├── auth/                   ┐ LOGIN E PERMISSÕES (doc 08)
│   ├── usuarios/               ┘
│   ├── bairros/                ┐
│   ├── lojas/                  │
│   ├── categorias/             │ MÓDULOS DE NEGÓCIO
│   ├── produtos/               │ (um por assunto)
│   └── reservas/               ┘
└── test/                       ← testes end-to-end
```

### `prisma/` (na raiz do backend): o desenho do banco
| Arquivo | Para que serve | Por que precisa existir |
|---|---|---|
| `schema.prisma` | Descreve as tabelas, os campos, os tipos e os relacionamentos | É a **fonte da verdade** do banco. O Prisma lê ele para criar as tabelas e gerar o código de acesso |
| `migrations/` | Arquivos `.sql` com cada mudança feita no banco, em ordem | É o **histórico do banco**, igual o Git é o histórico do código. Todo mundo (e o servidor) roda as mesmas migrations e tem o banco idêntico |

### `src/main.ts`: a porta de entrada
É o **primeiro arquivo que roda**. Ele liga o servidor e configura o que vale para a API inteira:
- `enableCors()`: deixa o front (porta 3000) chamar a API, e só ele;
- `ValidationPipe`: ativa a validação dos DTOs em **todas** as rotas;
- `PrismaExceptionFilter`: transforma erros do banco em 404/409;
- Swagger em `/docs`;
- `app.listen(3001)`: começa a escutar requisições.

### `src/app.module.ts`: o módulo raiz
É o "chefe de cozinha" que conhece todas as seções. Se um módulo não estiver listado aqui, **ele não existe para a API**:
```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lê o .env
    PrismaModule,                             // conexão com o banco
    LojasModule, CategoriasModule, ProdutosModule, ReservasModule,
  ],
  ...
})
export class AppModule {}
```

### `src/app.controller.ts` / `app.service.ts`
Vieram com o projeto. Usamos o controller para a rota `GET /health` (verifica se a API e o banco estão vivos).

### `src/prisma/`: a conexão com o banco
| Arquivo | Função |
|---|---|
| `prisma.service.ts` | Abre a conexão com o Postgres quando a API liga e fecha quando desliga. É por ele que todos os services falam com o banco |
| `prisma.module.ts` | Marcado como `@Global()`: disponibiliza o `PrismaService` para **todos** os módulos sem cada um precisar importar |

**Por que uma pasta separada?** Porque a conexão é **uma só**, compartilhada pela API toda. Se cada módulo abrisse a sua, seriam 4 conexões à toa.

### `src/generated/prisma/`: código gerado (não mexer!)
Criado pelo comando `npx prisma generate` a partir do `schema.prisma`. Contém os tipos (`Produto`, `Reserva`...) e os enums (`StatusEstoque`, `StatusReserva`). **Não vai para o Git** (está no `.gitignore`), porque é recriado no `npm install`.

### `src/common/`: o que é compartilhado entre módulos
| Pasta | Conteúdo | Por que aqui |
|---|---|---|
| `filters/prisma-exception.filter.ts` | Converte erro do Prisma em resposta HTTP (`P2025` vira 404, `P2002` vira 409) | Vale para **todos** os módulos; não faz sentido ficar dentro de um só |
| `utils/slugify.ts` | Transforma "Moda Feminina" em `moda-feminina` | Função genérica, reutilizável |

### `test/`: testes end-to-end
Sobem a API de verdade e fazem requisições HTTP. Os testes unitários ficam ao lado do código (`*.spec.ts`).

---

## 3. Dentro de um módulo (exemplo: `produtos/`)

```
src/produtos/
├── produtos.module.ts
├── produtos.controller.ts
├── produtos.service.ts
└── dto/
    ├── create-produto.dto.ts
    ├── update-produto.dto.ts
    ├── filtro-produtos.dto.ts
    └── atualizar-estoque.dto.ts
```

**Todos os 4 módulos (`lojas`, `categorias`, `produtos`, `reservas`) seguem exatamente essa mesma estrutura.** Quem entende um, entende todos. Essa é a grande vantagem do padrão.

### 3.1 Module: "a caixa que junta tudo"

```ts
@Module({
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
```

**O que faz:** diz ao Nest "este módulo tem este controller e este service".

**Por que precisa existir:**
- **Organização:** tudo de produtos fica numa caixa só. Se amanhã quiser tirar a funcionalidade, é só tirar o `ProdutosModule` do `AppModule`.
- **Injeção de dependência:** é aqui que o Nest descobre que o `ProdutosController` precisa de um `ProdutosService` e entrega ele pronto (ver seção 5).
- **Trabalho em grupo:** uma pessoa mexe em `produtos/` e outra em `reservas/` sem conflitar.

**Campos possíveis no `@Module`:**
| Campo | Significado |
|---|---|
| `controllers` | Quem recebe as requisições HTTP deste módulo |
| `providers` | Services e outras classes que podem ser injetadas |
| `imports` | Outros módulos dos quais este precisa |
| `exports` | O que este módulo empresta para outros módulos |

### 3.2 Controller: "o garçom"

```ts
@Controller('produtos')                       // todas as rotas começam com /produtos
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()                                      // GET /produtos
  findAll(@Query() filtro: FiltroProdutosDto) {
    return this.produtosService.findAll(filtro);
  }

  @Get(':id')                                 // GET /produtos/5
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id/estoque')                       // PATCH /produtos/5/estoque
  atualizarEstoque(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarEstoqueDto) {
    return this.produtosService.atualizarEstoque(id, dto.statusEstoque);
  }
}
```

**O que faz:** só cuida da parte **HTTP**:
- define **quais URLs existem** (`@Get`, `@Post`, `@Patch`, `@Delete`);
- **pega os dados** da requisição: `@Body()` (corpo JSON), `@Param()` (o `5` em `/produtos/5`), `@Query()` (o `?q=vestido`);
- chama o service e **devolve a resposta**.

**O que ele NÃO faz:** regra de negócio nem acesso ao banco. Repara que cada método tem **uma linha só**: ele repassa para o service.

**Por que separar do service?**
- Se um dia a API também for chamada por outro meio (fila, WebSocket, um script), a regra no service continua igual; só muda o "garçom".
- O controller fica fácil de ler: você bate o olho e vê **todas as rotas** do módulo.

`ParseIntPipe`: converte o `"5"` da URL em número `5`. Se vier `/produtos/abc`, já retorna **400** sozinho.

### 3.3 Service: "o cozinheiro"

```ts
@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService, config: ConfigService) { ... }

  async create(dto: CreateReservaDto) {
    const produto = await this.prisma.produto.findUniqueOrThrow({ where: { id: dto.produtoId } });

    if (produto.statusEstoque === StatusEstoque.ESGOTADO) {           // ← REGRA DE NEGÓCIO
      throw new BadRequestException('Produto esgotado, não é possível reservar');
    }

    const expiraEm = new Date(Date.now() + this.validadeHoras * 60 * 60 * 1000); // ← REGRA
    return this.prisma.reserva.create({ data: { ...dto, expiraEm } });           // ← BANCO
  }
}
```

**O que faz:** é onde mora a **inteligência** do sistema:
- **regras de negócio**: "não reserva produto esgotado", "reserva expira em 24h", "RETIRADA não pode virar CANCELADA";
- **acesso ao banco** via `this.prisma`;
- monta as consultas (ex: os filtros de busca do catálogo).

**Por que precisa existir:**
- **Regra num lugar só:** a regra "não reserva esgotado" está **só aqui**. Se mudar, muda num lugar.
- **Testável:** dá pra testar o service sem servidor e sem banco, passando um Prisma "de mentira" (mock). Foi o que fizemos em `reservas.service.spec.ts`: 10 testes das regras de reserva rodando em menos de 1 segundo.
- **Reutilizável:** outro service pode chamar este. Ex: um futuro módulo de relatórios pode usar o `ReservasService`.

`@Injectable()`: avisa ao Nest "esta classe pode ser injetada em outras".

### 3.4 DTO (pasta `dto/`): "o cardápio"

**DTO = Data Transfer Object** (objeto de transferência de dados). É uma classe que define **exatamente quais dados a API aceita** em cada operação, e **como eles devem ser**.

```ts
export class CreateReservaDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nomeCliente: string;

  @Matches(/^\d{10,13}$/, { message: 'whatsappCliente deve ter só números, com DDD' })
  whatsappCliente: string;

  @IsInt() @Min(1) @Max(99)
  quantidade: number;

  @Equals(true, { message: 'É preciso aceitar as regras e a política de privacidade (LGPD)' })
  aceiteLgpd: boolean;

  @IsInt()
  produtoId: number;
}
```

**Por que precisa existir:**
1. **Segurança:** nunca confie no que vem da internet. Sem DTO, alguém poderia mandar `{"status": "RETIRADA"}` direto na criação e burlar o fluxo. Com o `whitelist` + `forbidNonWhitelisted`, **campo que não está no DTO é recusado**.
2. **Dados corretos no banco:** WhatsApp com letra, quantidade 0 ou nome vazio **nem chegam** no service. São barrados antes, com **400** e uma mensagem clara.
3. **O service fica limpo:** como os dados já chegam validados, o service não precisa ficar checando `if (!nome)`, `if (quantidade < 1)`...
4. **Documentação automática:** o Swagger lê os DTOs e mostra no `/docs` quais campos cada rota aceita. O front sabe exatamente o que mandar.
5. **Tipagem:** o TypeScript sabe que `dto.quantidade` é número; o editor dá autocomplete e acusa erro.

**Por que vários DTOs por módulo?** Porque cada operação aceita dados diferentes:

| DTO | Usado em | Por que é separado |
|---|---|---|
| `create-produto.dto.ts` | `POST /produtos` | Para criar, `nome`, `preco`, `lojaId` e `categoriaId` são **obrigatórios** |
| `update-produto.dto.ts` | `PATCH /produtos/:id` | Para editar, você manda **só o que mudou**. Tudo vira opcional |
| `filtro-produtos.dto.ts` | `GET /produtos?...` | Os filtros da busca (`q`, `bairro`, `ordem`, `precoMax`...), todos opcionais |
| `atualizar-estoque.dto.ts` | `PATCH /produtos/:id/estoque` | Aceita **apenas** o `statusEstoque` (e só os 3 valores válidos) |

O `UpdateProdutoDto` é uma linha só:
```ts
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
```
`PartialType` = "copia todas as regras do Create, mas deixa tudo opcional". Assim **não repetimos** as validações.

**Quem aplica as regras do DTO?** O `ValidationPipe` configurado no `main.ts`. Ele roda **antes** do controller: se o dado for inválido, o controller nem é chamado.

---

## 4. O caminho completo de uma requisição

Exemplo: o cliente preenche o formulário de reserva e clica em "Reservar".

```
1. FRONT  ──POST /reservas {nomeCliente, whatsappCliente, quantidade, aceiteLgpd, produtoId}──▶

2. main.ts / ValidationPipe
      Confere o JSON contra o CreateReservaDto
      ❌ inválido → responde 400 com a lista de erros (para aqui)
      ✅ válido → segue

3. ReservasController.create(dto)
      "Recebi um pedido de reserva" → repassa para o service

4. ReservasService.create(dto)
      Busca o produto no banco         ❌ não existe → P2025 → filtro → 404
      Produto esgotado?                ❌ sim → 400 "Produto esgotado"
      Calcula expiraEm = agora + 24h
      Salva a reserva com status NOVA

5. PrismaService → PostgreSQL
      INSERT INTO reservas (...)

6. ◀── resposta JSON com a reserva criada (id, status NOVA, expiraEm, produto, loja) ──  FRONT
```

Cada etapa tem **um responsável**. Se der problema, você sabe onde olhar:
- erro de validação? → o DTO;
- rota não existe? → o controller;
- regra errada? → o service;
- dado errado no banco? → o schema.

---

## 5. Injeção de dependência (a "mágica" do construtor)

Repara que **ninguém** escreve `new ProdutosService()` ou `new PrismaService()` no projeto. Em vez disso:

```ts
constructor(private readonly produtosService: ProdutosService) {}
```

Isso diz: *"Nest, para eu funcionar, preciso de um ProdutosService. Me entrega um."* E o Nest entrega.

**Por que isso é bom:**
- **Uma instância só:** existe um `PrismaService` (uma conexão) compartilhado por todos, em vez de cada um criar o seu.
- **Fácil de testar:** no teste a gente troca o Prisma real por um falso:
  ```ts
  { provide: PrismaService, useValue: prismaMock }
  ```
  e o service nem percebe a diferença.
- **Menos acoplamento:** a classe diz **do que** precisa, não **como** criar.

**Quem é injetado em quem:**
```
ProdutosController ──precisa de──▶ ProdutosService ──precisa de──▶ PrismaService
ReservasController ──precisa de──▶ ReservasService ──precisa de──▶ PrismaService + ConfigService
```

---

## 6. Os 4 módulos lado a lado

| | Lojas | Categorias | Produtos | Reservas |
|---|---|---|---|---|
| Rota base | `/lojas` | `/categorias` | `/produtos` | `/reservas` |
| Criar | ✅ | ✅ | ✅ | ✅ |
| Listar | ✅ filtro bairro | ✅ | ✅ 7 filtros | ✅ filtro status/loja |
| Ver um | ✅ com produtos | ✅ | ✅ com loja | ✅ com produto/loja |
| Editar | ✅ | ✅ | ✅ + rota de estoque | só o status |
| Apagar | ✅ | ✅ (bloqueia se tiver produto) | ✅ | ❌ (mantém histórico) |
| Regras especiais | — | slug automático | busca por termo | esgotado, LGPD, transições, expiração |
| DTOs | create, update | create, update | create, update, filtro, estoque | create, filtro, status |

---

## 7. Perguntas que o professor pode fazer

**"Por que não colocar tudo no controller?"**
Porque o controller mistura HTTP com regra. Com service separado, a regra fica num lugar só, dá pra testar sem servidor e dá pra reutilizar.

**"Pra que serve o DTO se o banco já tem os tipos?"**
O banco só garante o **tipo** (texto, número). O DTO garante a **regra** (WhatsApp só com números, quantidade de 1 a 99, LGPD aceita) e **barra campos extras** antes de chegar no banco. É a primeira linha de defesa.

**"O que é o module e por que cada pasta tem um?"**
É o que agrupa controller e service de um assunto e registra eles no Nest. Cada assunto tem o seu para ficar isolado: dá pra desenvolver, testar e até remover um sem afetar os outros.

**"O que é injeção de dependência?"**
Em vez da classe criar o que precisa (`new`), ela pede no construtor e o framework entrega. Isso permite compartilhar uma única conexão com o banco e trocar por mocks nos testes.

**"Por que Prisma e não SQL direto?"**
Tipagem (o editor acusa erro se o campo não existe), migrations versionadas, proteção contra SQL injection e menos código.

**"Por que a reserva não tem DELETE?"**
Para manter o histórico. Reserva cancelada continua registrada com status `CANCELADA`.

**"Por que preço é Decimal e não Float?"**
`Float` tem erro de arredondamento (0.1 + 0.2 = 0.30000000000000004). Para dinheiro usamos `Decimal`, que é exato.

---

## 8. Glossário rápido

| Termo | Significado |
|---|---|
| **Decorator** (`@Algo`) | Uma "etiqueta" que dá um significado a classes, métodos ou campos (`@Get()`, `@IsInt()`) |
| **Endpoint / rota** | Um endereço da API + método HTTP (`GET /produtos`) |
| **CRUD** | Create, Read, Update, Delete: as 4 operações básicas |
| **Pipe** | Algo que transforma ou valida os dados antes do controller (`ValidationPipe`, `ParseIntPipe`) |
| **Filter** | Algo que captura erros e formata a resposta (`PrismaExceptionFilter`) |
| **Provider** | Qualquer classe que o Nest pode injetar (services, principalmente) |
| **Mock** | Uma versão falsa de algo, usada em testes |
| **Migration** | Um arquivo SQL que aplica uma mudança no banco, versionado no Git |
| **Enum** | Uma lista fixa de valores permitidos (`NOVA`, `CONFIRMADA`...) |
| **Slug** | Versão de um texto para URL (`moda-feminina`) |
