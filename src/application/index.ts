import { Repositories } from '../domain/repositories';
import { AlertaService } from './alerta.service';
import { BairroService } from './bairro.service';
import { LeituraService } from './leitura.service';
import { PontoRiscoService } from './ponto-risco.service';
import { RelatoService } from './relato.service';
import { SensorService } from './sensor.service';

export interface Services {
  bairros: BairroService;
  pontos: PontoRiscoService;
  sensores: SensorService;
  leituras: LeituraService;
  alertas: AlertaService;
  relatos: RelatoService;
}

export function criarServices(r: Repositories): Services {
  return {
    bairros: new BairroService(r.bairros),
    pontos: new PontoRiscoService(r.pontos, r.bairros, r.leituras, r.alertas),
    sensores: new SensorService(r.sensores, r.pontos, r.leituras),
    leituras: new LeituraService(r.sensores, r.pontos, r.leituras, r.alertas),
    alertas: new AlertaService(r.alertas),
    relatos: new RelatoService(r.relatos, r.bairros, r.pontos),
  };
}
