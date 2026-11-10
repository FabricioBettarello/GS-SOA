import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { criarServices } from '../../src/application';
import { criarRepositoriosMemoria } from '../../src/infra/memory/repositories';

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp(criarServices(criarRepositoriosMemoria()));
});

async function prepararPonto() {
  const bairro = await request(app).post('/api/v1/bairros').send({ nome: 'Pompeia', zona: 'OESTE' });
  const ponto = await request(app).post('/api/v1/pontos-risco').send({
    nome: 'Av. Pompeia x R. Turiassu',
    latitude: -23.5305,
    longitude: -46.6835,
    nivelAtencaoCm: 15,
    nivelCriticoCm: 30,
    bairroId: bairro.body.id,
  });
  await request(app).post('/api/v1/sensores').send({ codigo: 'esp32-pompeia-01', pontoRiscoId: ponto.body.id });
  return { bairroId: bairro.body.id as string, pontoId: ponto.body.id as string };
}

describe('API AlagaAlerta', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /bairros cria e GET /bairros lista', async () => {
    const criado = await request(app).post('/api/v1/bairros').send({ nome: 'Sé', zona: 'CENTRO' });
    expect(criado.status).toBe(201);
    expect(criado.body).toMatchObject({ nome: 'Sé', zona: 'CENTRO' });

    const lista = await request(app).get('/api/v1/bairros');
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);
  });

  it('retorna 400 com detalhes quando o corpo é inválido', async () => {
    const res = await request(app).post('/api/v1/bairros').send({ nome: 'X', zona: 'MARTE' });
    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Dados inválidos');
    expect(res.body.detalhes.map((d: { campo: string }) => d.campo)).toEqual(
      expect.arrayContaining(['nome', 'zona']),
    );
  });

  it('retorna 409 ao repetir o nome do bairro', async () => {
    await request(app).post('/api/v1/bairros').send({ nome: 'Sé', zona: 'CENTRO' });
    const res = await request(app).post('/api/v1/bairros').send({ nome: 'Sé', zona: 'CENTRO' });
    expect(res.status).toBe(409);
  });

  it('retorna 422 quando os limites do ponto são incoerentes', async () => {
    const bairro = await request(app).post('/api/v1/bairros').send({ nome: 'Lapa', zona: 'OESTE' });
    const res = await request(app).post('/api/v1/pontos-risco').send({
      nome: 'Ponto ruim', latitude: 0, longitude: 0, nivelAtencaoCm: 30, nivelCriticoCm: 10, bairroId: bairro.body.id,
    });
    expect(res.status).toBe(422);
  });

  it('retorna 404 para id inexistente', async () => {
    const res = await request(app).get('/api/v1/bairros/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('fluxo completo: leitura crítica do ESP32 gera alerta visível para o cidadão', async () => {
    const { bairroId, pontoId } = await prepararPonto();

    const leitura = await request(app)
      .post('/api/v1/leituras')
      .send({ codigoSensor: 'ESP32-POMPEIA-01', nivelAguaCm: 34, chuvaMmHora: 45 });
    expect(leitura.status).toBe(201);
    expect(leitura.body.nivel).toBe('CRITICO');
    expect(leitura.body.acao).toBe('CRIADO');

    const alertas = await request(app).get('/api/v1/alertas').query({ ativos: 'true', bairroId });
    expect(alertas.body).toHaveLength(1);
    expect(alertas.body[0].mensagem).toContain('Av. Pompeia');

    const status = await request(app).get(`/api/v1/pontos-risco/${pontoId}/status`);
    expect(status.body.nivelAtual).toBe('CRITICO');

    const baixou = await request(app).post('/api/v1/leituras').send({ codigoSensor: 'ESP32-POMPEIA-01', nivelAguaCm: 2 });
    expect(baixou.body.acao).toBe('ENCERRADO');
    const ativos = await request(app).get('/api/v1/alertas').query({ ativos: 'true' });
    expect(ativos.body).toHaveLength(0);
  });

  it('cidadão cria relato e a defesa civil confirma', async () => {
    const { bairroId, pontoId } = await prepararPonto();
    const relato = await request(app).post('/api/v1/relatos').send({
      bairroId, pontoRiscoId: pontoId, descricao: 'Água na altura do joelho', intensidade: 'ALTA',
    });
    expect(relato.status).toBe(201);
    expect(relato.body.status).toBe('ABERTO');

    const moderado = await request(app).patch(`/api/v1/relatos/${relato.body.id}/status`).send({ status: 'CONFIRMADO' });
    expect(moderado.status).toBe(200);
    expect(moderado.body.status).toBe('CONFIRMADO');
  });

  it('GET /docs.json expõe a documentação OpenAPI gerada automaticamente', async () => {
    const res = await request(app).get('/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/bairros', '/pontos-risco/{id}/status', '/leituras', '/alertas', '/relatos']),
    );
  });
});
