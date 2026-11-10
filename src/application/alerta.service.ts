import { Alerta } from '../domain/entities';
import { AlertaRepository } from '../domain/repositories';

export class AlertaService {
  constructor(private readonly alertas: AlertaRepository) {}

  listar(filtro?: { ativos?: boolean; bairroId?: string }): Promise<Alerta[]> {
    return this.alertas.findAll(filtro);
  }
}
