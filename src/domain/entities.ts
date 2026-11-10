export const ZONAS = ['CENTRO', 'NORTE', 'SUL', 'LESTE', 'OESTE'] as const;
export type Zona = (typeof ZONAS)[number];

export const NIVEIS_ALERTA = ['ATENCAO', 'CRITICO'] as const;
export type NivelAlerta = (typeof NIVEIS_ALERTA)[number];

export type NivelRisco = 'NORMAL' | NivelAlerta;

export const INTENSIDADES_RELATO = ['BAIXA', 'MEDIA', 'ALTA', 'INTRANSITAVEL'] as const;
export type IntensidadeRelato = (typeof INTENSIDADES_RELATO)[number];

export const STATUS_RELATO = ['ABERTO', 'CONFIRMADO', 'DESCARTADO'] as const;
export type StatusRelato = (typeof STATUS_RELATO)[number];

export interface Bairro {
  id: string;
  nome: string;
  zona: Zona;
  createdAt: Date;
}

export interface PontoRisco {
  id: string;
  nome: string;
  descricao: string | null;
  latitude: number;
  longitude: number;
  nivelAtencaoCm: number;
  nivelCriticoCm: number;
  bairroId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sensor {
  id: string;
  codigo: string;
  ativo: boolean;
  pontoRiscoId: string;
  createdAt: Date;
}

export interface Leitura {
  id: string;
  nivelAguaCm: number;
  chuvaMmHora: number | null;
  registradaEm: Date;
  sensorId: string;
}

export interface Alerta {
  id: string;
  nivel: NivelAlerta;
  mensagem: string;
  ativo: boolean;
  criadoEm: Date;
  encerradoEm: Date | null;
  pontoRiscoId: string;
}

export interface Relato {
  id: string;
  descricao: string;
  intensidade: IntensidadeRelato;
  status: StatusRelato;
  latitude: number | null;
  longitude: number | null;
  criadoEm: Date;
  bairroId: string;
  pontoRiscoId: string | null;
}

export type NovoBairro = Pick<Bairro, 'nome' | 'zona'>;
export type NovoPontoRisco = Omit<PontoRisco, 'id' | 'createdAt' | 'updatedAt'>;
export type NovoSensor = Pick<Sensor, 'codigo' | 'pontoRiscoId' | 'ativo'>;
export type NovaLeitura = Omit<Leitura, 'id'>;
export type NovoAlerta = Pick<Alerta, 'nivel' | 'mensagem' | 'pontoRiscoId'>;
export type NovoRelato = Omit<Relato, 'id' | 'criadoEm' | 'status'>;
