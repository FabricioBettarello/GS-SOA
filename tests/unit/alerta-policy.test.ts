import { describe, expect, it } from 'vitest';
import { classificarNivel, montarMensagem, validarLimites } from '../../src/domain/alerta-policy';
import { DomainError } from '../../src/domain/errors';

const limites = { nivelAtencaoCm: 15, nivelCriticoCm: 30 };

describe('classificarNivel', () => {
  it('retorna NORMAL abaixo do nível de atenção', () => {
    expect(classificarNivel(0, limites)).toBe('NORMAL');
    expect(classificarNivel(14.9, limites)).toBe('NORMAL');
  });

  it('retorna ATENCAO a partir do nível de atenção (inclusive)', () => {
    expect(classificarNivel(15, limites)).toBe('ATENCAO');
    expect(classificarNivel(29.9, limites)).toBe('ATENCAO');
  });

  it('retorna CRITICO a partir do nível crítico (inclusive)', () => {
    expect(classificarNivel(30, limites)).toBe('CRITICO');
    expect(classificarNivel(120, limites)).toBe('CRITICO');
  });
});

describe('validarLimites', () => {
  it('aceita limites coerentes', () => {
    expect(() => validarLimites(limites)).not.toThrow();
  });

  it('rejeita nível crítico menor ou igual ao de atenção', () => {
    expect(() => validarLimites({ nivelAtencaoCm: 30, nivelCriticoCm: 30 })).toThrow(DomainError);
    expect(() => validarLimites({ nivelAtencaoCm: 30, nivelCriticoCm: 10 })).toThrow(DomainError);
  });

  it('rejeita nível de atenção zero ou negativo', () => {
    expect(() => validarLimites({ nivelAtencaoCm: 0, nivelCriticoCm: 10 })).toThrow(DomainError);
  });
});

describe('montarMensagem', () => {
  it('gera mensagem simples com o nome do ponto e a altura arredondada', () => {
    const msg = montarMensagem('CRITICO', 'Praça da Bandeira', 31.6);
    expect(msg).toContain('Praça da Bandeira');
    expect(msg).toContain('32 cm');
    expect(msg).toMatch(/evite/i);
  });
});
