import { NovoRelato, Relato, StatusRelato } from '../domain/entities';
import { DomainError, NotFoundError } from '../domain/errors';
import { BairroRepository, PontoRiscoRepository, RelatoRepository } from '../domain/repositories';

export class RelatoService {
  constructor(
    private readonly relatos: RelatoRepository,
    private readonly bairros: BairroRepository,
    private readonly pontos: PontoRiscoRepository,
  ) {}

  async criar(dados: NovoRelato): Promise<Relato> {
    const bairro = await this.bairros.findById(dados.bairroId);
    if (!bairro) throw new NotFoundError('Bairro', dados.bairroId);

    if (dados.pontoRiscoId) {
      const ponto = await this.pontos.findById(dados.pontoRiscoId);
      if (!ponto) throw new NotFoundError('Ponto de risco', dados.pontoRiscoId);
      if (ponto.bairroId !== dados.bairroId) {
        throw new DomainError('O ponto de risco informado não pertence a este bairro.');
      }
    }
    return this.relatos.create(dados);
  }

  listar(filtro?: { bairroId?: string; status?: StatusRelato }): Promise<Relato[]> {
    return this.relatos.findAll(filtro);
  }

  async moderar(id: string, status: Exclude<StatusRelato, 'ABERTO'>): Promise<Relato> {
    const relato = await this.relatos.findById(id);
    if (!relato) throw new NotFoundError('Relato', id);
    if (relato.status !== 'ABERTO') {
      throw new DomainError(`Este relato já foi ${relato.status.toLowerCase()} e não pode mudar.`);
    }
    return this.relatos.updateStatus(id, status);
  }
}
