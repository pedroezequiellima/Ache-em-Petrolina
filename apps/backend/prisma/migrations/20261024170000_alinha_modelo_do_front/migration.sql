-- DropIndex
DROP INDEX "lojas_bairro_idx";

-- AlterTable
ALTER TABLE "lojas" DROP COLUMN "bairro",
ADD COLUMN     "avaliacao" DOUBLE PRECISION,
ADD COLUMN     "bairroId" INTEGER NOT NULL,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "totalAvaliacoes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "destaque" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "detalhes" TEXT[],
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "precoAntigo" DECIMAL(10,2),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "bairros" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "bairros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_loja" (
    "id" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "abre" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,

    CONSTRAINT "horarios_loja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bairros_nome_key" ON "bairros"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "bairros_slug_key" ON "bairros"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_loja_lojaId_diaSemana_key" ON "horarios_loja"("lojaId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "lojas_slug_key" ON "lojas"("slug");

-- CreateIndex
CREATE INDEX "lojas_bairroId_idx" ON "lojas"("bairroId");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_slug_key" ON "produtos"("slug");

-- AddForeignKey
ALTER TABLE "lojas" ADD CONSTRAINT "lojas_bairroId_fkey" FOREIGN KEY ("bairroId") REFERENCES "bairros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_loja" ADD CONSTRAINT "horarios_loja_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

