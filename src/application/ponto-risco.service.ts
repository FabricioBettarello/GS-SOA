import { classificarNivel, validarLimites } from '../domain/alerta-policy';
import { Alerta, Leitura, NivelRisco, NovoPontoRisco, PontoRisco } from '../domain/entities';
import { NotFoundError } from '../domain/errors';
import {
  AlertaRepository,
  BairroRepository,
  LeituraRepository,
  PontoRiscoRepository,
} from '../domain/repositories';

export interface StatusPonto {
  ponto: PontoRisco;
  nivelAtual: NivelRisco | 'SEM_DADOS';
  ultimaLeitura: Leitura | null;
  alertaAtivo: Alerta | null;
}

export class PontoRiscoService {
  constructor(
    private readonly pontos: PontoRiscoRepository,
    private readonly bairros: BairroRepository,
    private readonly leituras: LeituraRepository,
    private readonly alertas: AlertaRepository,
  ) {}

  async criar(dados: NovoPontoRisco): Promise<PontoRisco> {
    validarLimites(dados);
    await this.garantirBairro(dados.bairroId);
    return this.pontos.create(dados);
  }

  listar(filtro?: { bairroId?: string }): Promise<PontoRisco[]> {
    return this.pontos.findAll(filtro);
  }

  async buscar(id: string): Promise<PontoRisco> {
    const ponto = await this.pontos.findById(id);
    if (!ponto) throw new NotFoundError('Ponto de risco', id);
    return ponto;
  }

  async atualizar(id: string, dados: Partial<NovoPontoRisco>): Promise<PontoRisco> {
    const atual = await this.buscar(id);
    validarLimites({
      nivelAtencaoCm: dados.nivelAtencaoCm ?? atual.nivelAtencaoCm,
      nivelCriticoCm: dados.nivelCriticoCm ?? atual.nivelCriticoCm,
    });
    if (dados.bairroId) await this.garantirBairro(dados.bairroId);
    return this.pontos.update(id, dados);
  }

  async remover(id: string): Promise<void> {
    await this.buscar(id);
    await this.pontos.delete(id);
  }

  async status(id: string): Promise<StatusPonto> {
    const ponto = await this.buscar(id);
    const [ultimaLeitura, alertaAtivo] = await Promise.all([
      this.leituras.findUltimaDoPonto(id),
      this.alertas.findAtivoDoPonto(id),
    ]);
    const nivelAtual = ultimaLeitura ? classificarNivel(ultimaLeitura.nivelAguaCm, ponto) : 'SEM_DADOS';
    return { ponto, nivelAtual, ultimaLeitura, alertaAtivo };
  }

  private async garantirBairro(bairroId: string): Promise<void> {
    const bairro = await this.bairros.findById(bairroId);
    if (!bairro) throw new NotFoundError('Bairro', bairroId);
  }
}
