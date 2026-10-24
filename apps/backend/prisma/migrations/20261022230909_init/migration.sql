-- CreateEnum
CREATE TYPE "StatusEstoque" AS ENUM ('DISPONIVEL', 'POUCAS_UNIDADES', 'ESGOTADO');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('NOVA', 'CONFIRMADA', 'RETIRADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "lojas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "instagram" TEXT,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "logoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "fotos" TEXT[],
    "statusEstoque" "StatusEstoque" NOT NULL DEFAULT 'DISPONIVEL',
    "lojaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "whatsappCliente" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "aceiteLgpd" BOOLEAN NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'NOVA',
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lojas_bairro_idx" ON "lojas"("bairro");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "produtos_lojaId_idx" ON "produtos"("lojaId");

-- CreateIndex
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");

-- CreateIndex
CREATE INDEX "reservas_produtoId_idx" ON "reservas"("produtoId");

-- CreateIndex
CREATE INDEX "reservas_status_idx" ON "reservas"("status");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
