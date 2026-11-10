import { randomUUID } from 'node:crypto';
import {
  Alerta,
  Bairro,
  Leitura,
  NovaLeitura,
  NovoAlerta,
  NovoBairro,
  NovoPontoRisco,
  NovoRelato,
  NovoSensor,
  PontoRisco,
  Relato,
  Sensor,
  StatusRelato,
} from '../../domain/entities';
import {
  AlertaRepository,
  BairroRepository,
  LeituraRepository,
  PontoRiscoRepository,
  RelatoRepository,
  Repositories,
  SensorRepository,
} from '../../domain/repositories';

const copia = <T extends object>(obj: T): T => ({ ...obj });

export class MemoryBairroRepository implements BairroRepository {
  readonly itens: Bairro[] = [];
  async create(dados: NovoBairro) {
    const b: Bairro = { id: randomUUID(), createdAt: new Date(), ...dados };
    this.itens.push(b);
    return copia(b);
  }
  async findById(id: string) {
    const b = this.itens.find((x) => x.id === id);
    return b ? copia(b) : null;
  }
  async findByNome(nome: string) {
    const b = this.itens.find((x) => x.nome === nome);
    return b ? copia(b) : null;
  }
  async findAll() {
    return [...this.itens].sort((a, b) => a.nome.localeCompare(b.nome)).map(copia);
  }
}

export class MemoryPontoRiscoRepository implements PontoRiscoRepository {
  readonly itens: PontoRisco[] = [];
  async create(dados: NovoPontoRisco) {
    const agora = new Date();
    const p: PontoRisco = { id: randomUUID(), createdAt: agora, updatedAt: agora, ...dados };
    this.itens.push(p);
    return copia(p);
  }
  async findById(id: string) {
    const p = this.itens.find((x) => x.id === id);
    return p ? copia(p) : null;
  }
  async findAll(filtro: { bairroId?: string } = {}) {
    return this.itens.filter((p) => !filtro.bairroId || p.bairroId === filtro.bairroId).map(copia);
  }
  async update(id: string, dados: Partial<NovoPontoRisco>) {
    const p = this.itens.find((x) => x.id === id);
    if (!p) throw new Error('não encontrado');
    Object.assign(p, dados, { updatedAt: new Date() });
    return copia(p);
  }
  async delete(id: string) {
    const i = this.itens.findIndex((x) => x.id === id);
    if (i >= 0) this.itens.splice(i, 1);
  }
}

export class MemorySensorRepository implements SensorRepository {
  readonly itens: Sensor[] = [];
  async create(dados: NovoSensor) {
    const s: Sensor = { id: randomUUID(), createdAt: new Date(), ...dados };
    this.itens.push(s);
    return copia(s);
  }
  async findById(id: string) {
    const s = this.itens.find((x) => x.id === id);
    return s ? copia(s) : null;
  }
  async findByCodigo(codigo: string) {
    const s = this.itens.find((x) => x.codigo === codigo);
    return s ? copia(s) : null;
  }
  async findAll(filtro: { pontoRiscoId?: string } = {}) {
    return this.itens.filter((s) => !filtro.pontoRiscoId || s.pontoRiscoId === filtro.pontoRiscoId).map(copia);
  }
  async setAtivo(id: string, ativo: boolean) {
    const s = this.itens.find((x) => x.id === id);
    if (!s) throw new Error('não encontrado');
    s.ativo = ativo;
    return copia(s);
  }
}

export class MemoryLeituraRepository implements LeituraRepository {
  readonly itens: Leitura[] = [];
  constructor(private readonly sensores: MemorySensorRepository) {}
  async create(dados: NovaLeitura) {
    const l: Leitura = { id: randomUUID(), ...dados };
    this.itens.push(l);
    return copia(l);
  }
  async findBySensor(sensorId: string, limite: number) {
    return this.itens
      .filter((l) => l.sensorId === sensorId)
      .sort((a, b) => b.registradaEm.getTime() - a.registradaEm.getTime())
      .slice(0, limite)
      .map(copia);
  }
  async findUltimaDoPonto(pontoRiscoId: string) {
    const ids = new Set(this.sensores.itens.filter((s) => s.pontoRiscoId === pontoRiscoId).map((s) => s.id));
    const lista = this.itens
      .filter((l) => ids.has(l.sensorId))
      .sort((a, b) => b.registradaEm.getTime() - a.registradaEm.getTime());
    return lista[0] ? copia(lista[0]) : null;
  }
}

export class MemoryAlertaRepository implements AlertaRepository {
  readonly itens: Alerta[] = [];
  constructor(private readonly pontos: MemoryPontoRiscoRepository) {}
  async create(dados: NovoAlerta) {
    const a: Alerta = { id: randomUUID(), ativo: true, criadoEm: new Date(), encerradoEm: null, ...dados };
    this.itens.push(a);
    return copia(a);
  }
  async findAtivoDoPonto(pontoRiscoId: string) {
    const a = this.itens.find((x) => x.pontoRiscoId === pontoRiscoId && x.ativo);
    return a ? copia(a) : null;
  }
  async encerrar(id: string, em: Date) {
    const a = this.itens.find((x) => x.id === id);
    if (!a) throw new Error('não encontrado');
    a.ativo = false;
    a.encerradoEm = em;
    return copia(a);
  }
  async findAll(filtro: { ativos?: boolean; bairroId?: string } = {}) {
    return this.itens
      .filter((a) => filtro.ativos === undefined || a.ativo === filtro.ativos)
      .filter((a) => {
        if (!filtro.bairroId) return true;
        const ponto = this.pontos.itens.find((p) => p.id === a.pontoRiscoId);
        return ponto?.bairroId === filtro.bairroId;
      })
      .map(copia);
  }
}

export class MemoryRelatoRepository implements RelatoRepository {
  readonly itens: Relato[] = [];
  async create(dados: NovoRelato) {
    const r: Relato = { id: randomUUID(), status: 'ABERTO', criadoEm: new Date(), ...dados };
    this.itens.push(r);
    return copia(r);
  }
  async findById(id: string) {
    const r = this.itens.find((x) => x.id === id);
    return r ? copia(r) : null;
  }
  async findAll(filtro: { bairroId?: string; status?: StatusRelato } = {}) {
    return this.itens
      .filter((r) => !filtro.bairroId || r.bairroId === filtro.bairroId)
      .filter((r) => !filtro.status || r.status === filtro.status)
      .map(copia);
  }
  async updateStatus(id: string, status: StatusRelato) {
    const r = this.itens.find((x) => x.id === id);
    if (!r) throw new Error('não encontrado');
    r.status = status;
    return copia(r);
  }
}

export function criarRepositoriosMemoria(): Repositories {
  const pontos = new MemoryPontoRiscoRepository();
  const sensores = new MemorySensorRepository();
  return {
    bairros: new MemoryBairroRepository(),
    pontos,
    sensores,
    leituras: new MemoryLeituraRepository(sensores),
    alertas: new MemoryAlertaRepository(pontos),
    relatos: new MemoryRelatoRepository(),
  };
}
