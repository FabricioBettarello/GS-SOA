import { OpenAPIRegistry, OpenApiGeneratorV3, ResponseConfig } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import * as S from './schemas';

const registry = new OpenAPIRegistry();

const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });
const ok = (description: string, schema: z.ZodTypeAny): ResponseConfig => ({ description, ...json(schema) });
const erro = (description: string): ResponseConfig => ({ description, ...json(S.ErroSchema) });

const E400 = erro('Dados inválidos');
const E404 = erro('Recurso não encontrado');
const E409 = erro('Conflito: registro já existe');
const E422 = erro('Regra de negócio violada');

registry.registerPath({
  method: 'post', path: '/bairros', tags: ['Bairros'], summary: 'Cadastra um bairro',
  request: { body: json(S.CriarBairroBody) },
  responses: { 201: ok('Bairro criado', S.BairroSchema), 400: E400, 409: E409 },
});
registry.registerPath({
  method: 'get', path: '/bairros', tags: ['Bairros'], summary: 'Lista os bairros',
  responses: { 200: ok('Lista de bairros', z.array(S.BairroSchema)) },
});
registry.registerPath({
  method: 'get', path: '/bairros/{id}', tags: ['Bairros'], summary: 'Busca um bairro',
  request: { params: S.IdParam },
  responses: { 200: ok('Bairro', S.BairroSchema), 404: E404 },
});

registry.registerPath({
  method: 'post', path: '/pontos-risco', tags: ['Pontos de risco'], summary: 'Cadastra um ponto que costuma alagar',
  request: { body: json(S.CriarPontoRiscoBody) },
  responses: { 201: ok('Ponto criado', S.PontoRiscoSchema), 400: E400, 404: E404, 422: E422 },
});
registry.registerPath({
  method: 'get', path: '/pontos-risco', tags: ['Pontos de risco'], summary: 'Lista pontos de risco (filtro por bairro)',
  request: { query: S.ListarPontosQuery },
  responses: { 200: ok('Lista de pontos', z.array(S.PontoRiscoSchema)) },
});
registry.registerPath({
  method: 'get', path: '/pontos-risco/{id}', tags: ['Pontos de risco'], summary: 'Busca um ponto de risco',
  request: { params: S.IdParam },
  responses: { 200: ok('Ponto', S.PontoRiscoSchema), 404: E404 },
});
registry.registerPath({
  method: 'patch', path: '/pontos-risco/{id}', tags: ['Pontos de risco'], summary: 'Atualiza dados ou limites do ponto',
  request: { params: S.IdParam, body: json(S.AtualizarPontoRiscoBody) },
  responses: { 200: ok('Ponto atualizado', S.PontoRiscoSchema), 400: E400, 404: E404, 422: E422 },
});
registry.registerPath({
  method: 'delete', path: '/pontos-risco/{id}', tags: ['Pontos de risco'], summary: 'Remove um ponto (e seus sensores)',
  request: { params: S.IdParam },
  responses: { 204: { description: 'Removido' }, 404: E404 },
});
registry.registerPath({
  method: 'get', path: '/pontos-risco/{id}/status', tags: ['Pontos de risco'],
  summary: 'Situação atual do ponto (o que o app mostra ao cidadão)',
  request: { params: S.IdParam },
  responses: { 200: ok('Status do ponto', S.StatusPontoSchema), 404: E404 },
});

registry.registerPath({
  method: 'post', path: '/sensores', tags: ['Sensores'], summary: 'Cadastra um sensor ESP32 num ponto',
  request: { body: json(S.CriarSensorBody) },
  responses: { 201: ok('Sensor criado', S.SensorSchema), 400: E400, 404: E404, 409: E409 },
});
registry.registerPath({
  method: 'get', path: '/sensores', tags: ['Sensores'], summary: 'Lista sensores',
  request: { query: S.ListarSensoresQuery },
  responses: { 200: ok('Lista de sensores', z.array(S.SensorSchema)) },
});
registry.registerPath({
  method: 'patch', path: '/sensores/{id}', tags: ['Sensores'], summary: 'Ativa ou desativa um sensor',
  request: { params: S.IdParam, body: json(S.AtualizarSensorBody) },
  responses: { 200: ok('Sensor atualizado', S.SensorSchema), 400: E400, 404: E404 },
});
registry.registerPath({
  method: 'get', path: '/sensores/{id}/leituras', tags: ['Sensores'], summary: 'Histórico de leituras do sensor',
  request: { params: S.IdParam, query: S.HistoricoQuery },
  responses: { 200: ok('Leituras (mais recentes primeiro)', z.array(S.LeituraSchema)), 404: E404 },
});

registry.registerPath({
  method: 'post', path: '/leituras', tags: ['Leituras'],
  summary: 'Recebe a medição do ESP32 e atualiza os alertas automaticamente',
  request: { body: json(S.RegistrarLeituraBody) },
  responses: { 201: ok('Leitura registrada e alerta avaliado', S.ResultadoLeituraSchema), 400: E400, 404: E404, 422: E422 },
});

registry.registerPath({
  method: 'get', path: '/alertas', tags: ['Alertas'], summary: 'Lista alertas (ativos e/ou por bairro)',
  request: { query: S.ListarAlertasQuery },
  responses: { 200: ok('Lista de alertas', z.array(S.AlertaSchema)) },
});

registry.registerPath({
  method: 'post', path: '/relatos', tags: ['Relatos'], summary: 'Cidadão relata um alagamento (sem dados pessoais)',
  request: { body: json(S.CriarRelatoBody) },
  responses: { 201: ok('Relato criado', S.RelatoSchema), 400: E400, 404: E404, 422: E422 },
});
registry.registerPath({
  method: 'get', path: '/relatos', tags: ['Relatos'], summary: 'Lista relatos',
  request: { query: S.ListarRelatosQuery },
  responses: { 200: ok('Lista de relatos', z.array(S.RelatoSchema)) },
});
registry.registerPath({
  method: 'patch', path: '/relatos/{id}/status', tags: ['Relatos'], summary: 'Confirma ou descarta um relato',
  request: { params: S.IdParam, body: json(S.ModerarRelatoBody) },
  responses: { 200: ok('Relato moderado', S.RelatoSchema), 400: E400, 404: E404, 422: E422 },
});

export function gerarDocumentoOpenApi() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'AlagaAlerta API',
      version: '1.0.0',
      description:
        'Backend da CitizenTech AlagaAlerta: sensores ESP32 medem o nível da água em pontos que ' +
        'costumam alagar em São Paulo, a API gera alertas automaticamente e o cidadão consulta e ' +
        'relata alagamentos pelo app. Global Solution FIAP 2026.2.',
    },
    servers: [{ url: '/api/v1' }],
  });
}
