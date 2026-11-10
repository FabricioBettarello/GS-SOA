import { Leitura, NovoSensor, Sensor } from '../domain/entities';
import { ConflictError, NotFoundError } from '../domain/errors';
import { LeituraRepository, PontoRiscoRepository, SensorRepository } from '../domain/repositories';

export class SensorService {
  constructor(
    private readonly sensores: SensorRepository,
    private readonly pontos: PontoRiscoRepository,
    private readonly leituras: LeituraRepository,
  ) {}

  async criar(dados: NovoSensor): Promise<Sensor> {
    const ponto = await this.pontos.findById(dados.pontoRiscoId);
    if (!ponto) throw new NotFoundError('Ponto de risco', dados.pontoRiscoId);
    const existente = await this.sensores.findByCodigo(dados.codigo);
    if (existente) throw new ConflictError(`Já existe um sensor com o código ${dados.codigo}.`);
    return this.sensores.create(dados);
  }

  listar(filtro?: { pontoRiscoId?: string }): Promise<Sensor[]> {
    return this.sensores.findAll(filtro);
  }

  async buscar(id: string): Promise<Sensor> {
    const sensor = await this.sensores.findById(id);
    if (!sensor) throw new NotFoundError('Sensor', id);
    return sensor;
  }

  async alterarAtivo(id: string, ativo: boolean): Promise<Sensor> {
    await this.buscar(id);
    return this.sensores.setAtivo(id, ativo);
  }

  async historico(id: string, limite: number): Promise<Leitura[]> {
    await this.buscar(id);
    return this.leituras.findBySensor(id, limite);
  }
}
