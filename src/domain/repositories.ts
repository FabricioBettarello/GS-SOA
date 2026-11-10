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
} from './entities';

export interface BairroRepository {
  create(dados: NovoBairro): Promise<Bairro>;
  findById(id: string): Promise<Bairro | null>;
  findByNome(nome: string): Promise<Bairro | null>;
  findAll(): Promise<Bairro[]>;
}

export interface PontoRiscoRepository {
  create(dados: NovoPontoRisco): Promise<PontoRisco>;
  findById(id: string): Promise<PontoRisco | null>;
  findAll(filtro?: { bairroId?: string }): Promise<PontoRisco[]>;
  update(id: string, dados: Partial<NovoPontoRisco>): Promise<PontoRisco>;
  delete(id: string): Promise<void>;
}

export interface SensorRepository {
  create(dados: NovoSensor): Promise<Sensor>;
  findById(id: string): Promise<Sensor | null>;
  findByCodigo(codigo: string): Promise<Sensor | null>;
  findAll(filtro?: { pontoRiscoId?: string }): Promise<Sensor[]>;
  setAtivo(id: string, ativo: boolean): Promise<Sensor>;
}

export interface LeituraRepository {
  create(dados: NovaLeitura): Promise<Leitura>;
  findBySensor(sensorId: string, limite: number): Promise<Leitura[]>;
  findUltimaDoPonto(pontoRiscoId: string): Promise<Leitura | null>;
}

export interface AlertaRepository {
  create(dados: NovoAlerta): Promise<Alerta>;
  findAtivoDoPonto(pontoRiscoId: string): Promise<Alerta | null>;
  encerrar(id: string, em: Date): Promise<Alerta>;
  findAll(filtro?: { ativos?: boolean; bairroId?: string }): Promise<Alerta[]>;
}

export interface RelatoRepository {
  create(dados: NovoRelato): Promise<Relato>;
  findById(id: string): Promise<Relato | null>;
  findAll(filtro?: { bairroId?: string; status?: StatusRelato }): Promise<Relato[]>;
  updateStatus(id: string, status: StatusRelato): Promise<Relato>;
}

export interface Repositories {
  bairros: BairroRepository;
  pontos: PontoRiscoRepository;
  sensores: SensorRepository;
  leituras: LeituraRepository;
  alertas: AlertaRepository;
  relatos: RelatoRepository;
}
