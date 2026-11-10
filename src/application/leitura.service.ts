import { classificarNivel, montarMensagem } from '../domain/alerta-policy';
import { Alerta, Leitura, NivelRisco } from '../domain/entities';
import { DomainError, NotFoundError } from '../domain/errors';
import {
  AlertaRepository,
  LeituraRepository,
  PontoRiscoRepository,
  SensorRepository,
} from '../domain/repositories';

export interface RegistrarLeituraInput {
  codigoSensor: string;
  nivelAguaCm: number;
  chuvaMmHora?: number;
  registradaEm?: Date;
}

export type AcaoAlerta = 'NENHUMA' | 'CRIADO' | 'ATUALIZADO' | 'MANTIDO' | 'ENCERRADO';

export interface ResultadoLeitura {
  leitura: Leitura;
  nivel: NivelRisco;
  acao: AcaoAlerta;
  alerta: Alerta | null;
}

export class LeituraService {
  constructor(
    private readonly sensores: SensorRepository,
    private readonly pontos: PontoRiscoRepository,
    private readonly leituras: LeituraRepository,
    private readonly alertas: AlertaRepository,
    private readonly agora: () => Date = () => new Date(),
  ) {}

  async registrar(input: RegistrarLeituraInput): Promise<ResultadoLeitura> {
    const sensor = await this.sensores.findByCodigo(input.codigoSensor);
    if (!sensor) throw new NotFoundError('Sensor', input.codigoSensor);
    if (!sensor.ativo) throw new DomainError(`O sensor ${sensor.codigo} está inativo.`);

    const ponto = await this.pontos.findById(sensor.pontoRiscoId);
    if (!ponto) throw new NotFoundError('Ponto de risco', sensor.pontoRiscoId);

    const leitura = await this.leituras.create({
      sensorId: sensor.id,
      nivelAguaCm: input.nivelAguaCm,
      chuvaMmHora: input.chuvaMmHora ?? null,
      registradaEm: input.registradaEm ?? this.agora(),
    });

    const nivel = classificarNivel(leitura.nivelAguaCm, ponto);
    const alertaAtivo = await this.alertas.findAtivoDoPonto(ponto.id);

    if (nivel === 'NORMAL') {
      if (!alertaAtivo) return { leitura, nivel, acao: 'NENHUMA', alerta: null };
      const encerrado = await this.alertas.encerrar(alertaAtivo.id, this.agora());
      return { leitura, nivel, acao: 'ENCERRADO', alerta: encerrado };
    }

    if (alertaAtivo && alertaAtivo.nivel === nivel) {
      return { leitura, nivel, acao: 'MANTIDO', alerta: alertaAtivo };
    }

    if (alertaAtivo) await this.alertas.encerrar(alertaAtivo.id, this.agora());

    const novo = await this.alertas.create({
      pontoRiscoId: ponto.id,
      nivel,
      mensagem: montarMensagem(nivel, ponto.nome, leitura.nivelAguaCm),
    });
    return { leitura, nivel, acao: alertaAtivo ? 'ATUALIZADO' : 'CRIADO', alerta: novo };
  }
}
