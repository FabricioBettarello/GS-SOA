import { beforeEach, describe, expect, it } from 'vitest';
import { criarServices, Services } from '../../src/application';
import { DomainError, NotFoundError } from '../../src/domain/errors';
import { Repositories } from '../../src/domain/repositories';
import { criarRepositoriosMemoria } from '../../src/infra/memory/repositories';

describe('LeituraService.registrar (regra de alertas)', () => {
  let repos: Repositories;
  let s: Services;
  let pontoId: string;

  beforeEach(async () => {
    repos = criarRepositoriosMemoria();
    s = criarServices(repos);
    const bairro = await s.bairros.criar({ nome: 'Pompeia', zona: 'OESTE' });
    const ponto = await s.pontos.criar({
      nome: 'Av. Pompeia',
      descricao: null,
      latitude: -23.53,
      longitude: -46.68,
      nivelAtencaoCm: 15,
      nivelCriticoCm: 30,
      bairroId: bairro.id,
    });
    pontoId = ponto.id;
    await s.sensores.criar({ codigo: 'ESP32-01', pontoRiscoId: ponto.id, ativo: true });
  });

  const enviar = (nivelAguaCm: number) => s.leituras.registrar({ codigoSensor: 'ESP32-01', nivelAguaCm });

  it('não cria alerta quando a água está em nível normal', async () => {
    const r = await enviar(5);
    expect(r.nivel).toBe('NORMAL');
    expect(r.acao).toBe('NENHUMA');
    expect(await repos.alertas.findAll()).toHaveLength(0);
  });

  it('cria alerta de ATENCAO quando passa do primeiro limite', async () => {
    const r = await enviar(18);
    expect(r.acao).toBe('CRIADO');
    expect(r.alerta?.nivel).toBe('ATENCAO');
  });

  it('não duplica alerta se o nível continuar o mesmo', async () => {
    await enviar(18);
    const r = await enviar(22);
    expect(r.acao).toBe('MANTIDO');
    expect(await repos.alertas.findAll({ ativos: true })).toHaveLength(1);
  });

  it('escala de ATENCAO para CRITICO, encerrando o alerta anterior', async () => {
    await enviar(18);
    const r = await enviar(35);
    expect(r.acao).toBe('ATUALIZADO');
    expect(r.alerta?.nivel).toBe('CRITICO');
    const ativos = await repos.alertas.findAll({ ativos: true });
    expect(ativos).toHaveLength(1);
    expect(ativos[0].nivel).toBe('CRITICO');
    expect(await repos.alertas.findAll({ ativos: false })).toHaveLength(1);
  });

  it('encerra o alerta quando a água baixa', async () => {
    await enviar(35);
    const r = await enviar(3);
    expect(r.acao).toBe('ENCERRADO');
    expect(r.alerta?.ativo).toBe(false);
    expect(r.alerta?.encerradoEm).toBeInstanceOf(Date);
    expect(await repos.alertas.findAtivoDoPonto(pontoId)).toBeNull();
  });

  it('recusa leitura de sensor desconhecido', async () => {
    await expect(s.leituras.registrar({ codigoSensor: 'NAO-EXISTE', nivelAguaCm: 10 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('recusa leitura de sensor inativo', async () => {
    const [sensor] = await repos.sensores.findAll();
    await s.sensores.alterarAtivo(sensor.id, false);
    await expect(enviar(10)).rejects.toBeInstanceOf(DomainError);
  });

  it('status do ponto reflete a última leitura e o alerta ativo', async () => {
    await enviar(40);
    const status = await s.pontos.status(pontoId);
    expect(status.nivelAtual).toBe('CRITICO');
    expect(status.ultimaLeitura?.nivelAguaCm).toBe(40);
    expect(status.alertaAtivo?.nivel).toBe('CRITICO');
  });
});
