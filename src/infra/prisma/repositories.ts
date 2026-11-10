import { PrismaClient } from '@prisma/client';
import {
  AlertaRepository,
  BairroRepository,
  LeituraRepository,
  PontoRiscoRepository,
  RelatoRepository,
  Repositories,
  SensorRepository,
} from '../../domain/repositories';

export class PrismaBairroRepository implements BairroRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<BairroRepository['create']>[0]) {
    return this.db.bairro.create({ data: dados });
  }
  findById(id: string) {
    return this.db.bairro.findUnique({ where: { id } });
  }
  findByNome(nome: string) {
    return this.db.bairro.findUnique({ where: { nome } });
  }
  findAll() {
    return this.db.bairro.findMany({ orderBy: { nome: 'asc' } });
  }
}

export class PrismaPontoRiscoRepository implements PontoRiscoRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<PontoRiscoRepository['create']>[0]) {
    return this.db.pontoRisco.create({ data: dados });
  }
  findById(id: string) {
    return this.db.pontoRisco.findUnique({ where: { id } });
  }
  findAll(filtro: { bairroId?: string } = {}) {
    return this.db.pontoRisco.findMany({ where: { bairroId: filtro.bairroId }, orderBy: { nome: 'asc' } });
  }
  update(id: string, dados: Parameters<PontoRiscoRepository['update']>[1]) {
    return this.db.pontoRisco.update({ where: { id }, data: dados });
  }
  async delete(id: string) {
    await this.db.pontoRisco.delete({ where: { id } });
  }
}

export class PrismaSensorRepository implements SensorRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<SensorRepository['create']>[0]) {
    return this.db.sensor.create({ data: dados });
  }
  findById(id: string) {
    return this.db.sensor.findUnique({ where: { id } });
  }
  findByCodigo(codigo: string) {
    return this.db.sensor.findUnique({ where: { codigo } });
  }
  findAll(filtro: { pontoRiscoId?: string } = {}) {
    return this.db.sensor.findMany({ where: { pontoRiscoId: filtro.pontoRiscoId }, orderBy: { codigo: 'asc' } });
  }
  setAtivo(id: string, ativo: boolean) {
    return this.db.sensor.update({ where: { id }, data: { ativo } });
  }
}

export class PrismaLeituraRepository implements LeituraRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<LeituraRepository['create']>[0]) {
    return this.db.leitura.create({ data: dados });
  }
  findBySensor(sensorId: string, limite: number) {
    return this.db.leitura.findMany({ where: { sensorId }, orderBy: { registradaEm: 'desc' }, take: limite });
  }
  findUltimaDoPonto(pontoRiscoId: string) {
    return this.db.leitura.findFirst({
      where: { sensor: { pontoRiscoId } },
      orderBy: { registradaEm: 'desc' },
    });
  }
}

export class PrismaAlertaRepository implements AlertaRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<AlertaRepository['create']>[0]) {
    return this.db.alerta.create({ data: dados });
  }
  findAtivoDoPonto(pontoRiscoId: string) {
    return this.db.alerta.findFirst({ where: { pontoRiscoId, ativo: true }, orderBy: { criadoEm: 'desc' } });
  }
  encerrar(id: string, em: Date) {
    return this.db.alerta.update({ where: { id }, data: { ativo: false, encerradoEm: em } });
  }
  findAll(filtro: { ativos?: boolean; bairroId?: string } = {}) {
    return this.db.alerta.findMany({
      where: {
        ativo: filtro.ativos,
        pontoRisco: filtro.bairroId ? { bairroId: filtro.bairroId } : undefined,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }
}

export class PrismaRelatoRepository implements RelatoRepository {
  constructor(private readonly db: PrismaClient) {}
  create(dados: Parameters<RelatoRepository['create']>[0]) {
    return this.db.relato.create({ data: dados });
  }
  findById(id: string) {
    return this.db.relato.findUnique({ where: { id } });
  }
  findAll(filtro: Parameters<RelatoRepository['findAll']>[0] = {}) {
    return this.db.relato.findMany({
      where: { bairroId: filtro.bairroId, status: filtro.status },
      orderBy: { criadoEm: 'desc' },
    });
  }
  updateStatus(id: string, status: Parameters<RelatoRepository['updateStatus']>[1]) {
    return this.db.relato.update({ where: { id }, data: { status } });
  }
}

export function criarRepositoriosPrisma(db: PrismaClient): Repositories {
  return {
    bairros: new PrismaBairroRepository(db),
    pontos: new PrismaPontoRiscoRepository(db),
    sensores: new PrismaSensorRepository(db),
    leituras: new PrismaLeituraRepository(db),
    alertas: new PrismaAlertaRepository(db),
    relatos: new PrismaRelatoRepository(db),
  };
}
