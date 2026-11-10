-- CreateEnum
CREATE TYPE "Zona" AS ENUM ('CENTRO', 'NORTE', 'SUL', 'LESTE', 'OESTE');

-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('ATENCAO', 'CRITICO');

-- CreateTable
CREATE TABLE "bairros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "zona" "Zona" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bairros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos_risco" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "nivel_atencao_cm" DOUBLE PRECISION NOT NULL,
    "nivel_critico_cm" DOUBLE PRECISION NOT NULL,
    "bairro_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pontos_risco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensores" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ponto_risco_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leituras" (
    "id" TEXT NOT NULL,
    "nivel_agua_cm" DOUBLE PRECISION NOT NULL,
    "chuva_mm_hora" DOUBLE PRECISION,
    "registrada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensor_id" TEXT NOT NULL,

    CONSTRAINT "leituras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "nivel" "NivelAlerta" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerrado_em" TIMESTAMP(3),
    "ponto_risco_id" TEXT NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bairros_nome_key" ON "bairros"("nome");

-- CreateIndex
CREATE INDEX "pontos_risco_bairro_id_idx" ON "pontos_risco"("bairro_id");

-- CreateIndex
CREATE UNIQUE INDEX "sensores_codigo_key" ON "sensores"("codigo");

-- CreateIndex
CREATE INDEX "sensores_ponto_risco_id_idx" ON "sensores"("ponto_risco_id");

-- CreateIndex
CREATE INDEX "leituras_sensor_id_registrada_em_idx" ON "leituras"("sensor_id", "registrada_em");

-- CreateIndex
CREATE INDEX "alertas_ponto_risco_id_ativo_idx" ON "alertas"("ponto_risco_id", "ativo");

-- AddForeignKey
ALTER TABLE "pontos_risco" ADD CONSTRAINT "pontos_risco_bairro_id_fkey" FOREIGN KEY ("bairro_id") REFERENCES "bairros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensores" ADD CONSTRAINT "sensores_ponto_risco_id_fkey" FOREIGN KEY ("ponto_risco_id") REFERENCES "pontos_risco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leituras" ADD CONSTRAINT "leituras_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_ponto_risco_id_fkey" FOREIGN KEY ("ponto_risco_id") REFERENCES "pontos_risco"("id") ON DELETE CASCADE ON UPDATE CASCADE;
