-- CreateEnum
CREATE TYPE "IntensidadeRelato" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'INTRANSITAVEL');

-- CreateEnum
CREATE TYPE "StatusRelato" AS ENUM ('ABERTO', 'CONFIRMADO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "relatos" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "intensidade" "IntensidadeRelato" NOT NULL,
    "status" "StatusRelato" NOT NULL DEFAULT 'ABERTO',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bairro_id" TEXT NOT NULL,
    "ponto_risco_id" TEXT,

    CONSTRAINT "relatos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "relatos_bairro_id_status_idx" ON "relatos"("bairro_id", "status");

-- AddForeignKey
ALTER TABLE "relatos" ADD CONSTRAINT "relatos_bairro_id_fkey" FOREIGN KEY ("bairro_id") REFERENCES "bairros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatos" ADD CONSTRAINT "relatos_ponto_risco_id_fkey" FOREIGN KEY ("ponto_risco_id") REFERENCES "pontos_risco"("id") ON DELETE SET NULL ON UPDATE CASCADE;
