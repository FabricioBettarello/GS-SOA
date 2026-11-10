import { NivelAlerta, NivelRisco } from './entities';
import { DomainError } from './errors';

export interface Limites {
  nivelAtencaoCm: number;
  nivelCriticoCm: number;
}

export function validarLimites({ nivelAtencaoCm, nivelCriticoCm }: Limites): void {
  if (nivelAtencaoCm <= 0) {
    throw new DomainError('O nível de atenção deve ser maior que zero.');
  }
  if (nivelCriticoCm <= nivelAtencaoCm) {
    throw new DomainError('O nível crítico deve ser maior que o nível de atenção.');
  }
}

export function classificarNivel(nivelAguaCm: number, limites: Limites): NivelRisco {
  if (nivelAguaCm >= limites.nivelCriticoCm) return 'CRITICO';
  if (nivelAguaCm >= limites.nivelAtencaoCm) return 'ATENCAO';
  return 'NORMAL';
}

export function montarMensagem(nivel: NivelAlerta, nomePonto: string, nivelAguaCm: number): string {
  const cm = Math.round(nivelAguaCm);
  if (nivel === 'CRITICO') {
    return `Alagamento em ${nomePonto}. A água está com ${cm} cm. Evite passar pelo local.`;
  }
  return `Atenção: a água está subindo em ${nomePonto} (${cm} cm). Se puder, use outro caminho.`;
}
