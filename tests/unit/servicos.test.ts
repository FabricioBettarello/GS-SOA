import { beforeEach, describe, expect, it } from 'vitest';
import { criarServices, Services } from '../../src/application';
import { ConflictError, DomainError, NotFoundError } from '../../src/domain/errors';
import { criarRepositoriosMemoria } from '../../src/infra/memory/repositories';

describe('Regras dos demais serviços', () => {
  let s: Services;

  beforeEach(() => {
    s = criarServices(criarRepositoriosMemoria());
  });

  it('não permite bairro com nome repetido', async () => {
    await s.bairros.criar({ nome: 'Sé', zona: 'CENTRO' });
    await expect(s.bairros.criar({ nome: 'Sé', zona: 'CENTRO' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('não cria ponto de risco em bairro inexistente', async () => {
    await expect(
      s.pontos.criar({
        nome: 'Ponto X',
        descricao: null,
        latitude: 0,
        longitude: 0,
        nivelAtencaoCm: 10,
        nivelCriticoCm: 20,
        bairroId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('não aceita atualização que deixe o limite crítico abaixo do de atenção', async () => {
    const b = await s.bairros.criar({ nome: 'Lapa', zona: 'OESTE' });
    const p = await s.pontos.criar({
      nome: 'Ponto Lapa', descricao: null, latitude: 0, longitude: 0,
      nivelAtencaoCm: 10, nivelCriticoCm: 20, bairroId: b.id,
    });
    await expect(s.pontos.atualizar(p.id, { nivelCriticoCm: 5 })).rejects.toBeInstanceOf(DomainError);
  });

  it('relato só pode ser moderado uma vez', async () => {
    const b = await s.bairros.criar({ nome: 'Aricanduva', zona: 'LESTE' });
    const r = await s.relatos.criar({
      bairroId: b.id, pontoRiscoId: null, descricao: 'Rua alagada', intensidade: 'ALTA',
      latitude: null, longitude: null,
    });
    const confirmado = await s.relatos.moderar(r.id, 'CONFIRMADO');
    expect(confirmado.status).toBe('CONFIRMADO');
    await expect(s.relatos.moderar(r.id, 'DESCARTADO')).rejects.toBeInstanceOf(DomainError);
  });

  it('relato não pode apontar ponto de outro bairro', async () => {
    const b1 = await s.bairros.criar({ nome: 'Bairro 1', zona: 'SUL' });
    const b2 = await s.bairros.criar({ nome: 'Bairro 2', zona: 'SUL' });
    const p = await s.pontos.criar({
      nome: 'Ponto do bairro 1', descricao: null, latitude: 0, longitude: 0,
      nivelAtencaoCm: 10, nivelCriticoCm: 20, bairroId: b1.id,
    });
    await expect(
      s.relatos.criar({
        bairroId: b2.id, pontoRiscoId: p.id, descricao: 'Alagou aqui', intensidade: 'BAIXA',
        latitude: null, longitude: null,
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
