import { Router } from 'express';
import { Services } from '../application';
import { asyncHandler } from './middlewares';
import * as S from './schemas';

export function criarRotas(s: Services): Router {
  const r = Router();

  r.post('/bairros', asyncHandler(async (req, res) => {
    const body = S.CriarBairroBody.parse(req.body);
    res.status(201).json(await s.bairros.criar(body));
  }));
  r.get('/bairros', asyncHandler(async (_req, res) => {
    res.json(await s.bairros.listar());
  }));
  r.get('/bairros/:id', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    res.json(await s.bairros.buscar(id));
  }));

  r.post('/pontos-risco', asyncHandler(async (req, res) => {
    const body = S.CriarPontoRiscoBody.parse(req.body);
    res.status(201).json(await s.pontos.criar({ ...body, descricao: body.descricao ?? null }));
  }));
  r.get('/pontos-risco', asyncHandler(async (req, res) => {
    const filtro = S.ListarPontosQuery.parse(req.query);
    res.json(await s.pontos.listar(filtro));
  }));
  r.get('/pontos-risco/:id', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    res.json(await s.pontos.buscar(id));
  }));
  r.patch('/pontos-risco/:id', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    const body = S.AtualizarPontoRiscoBody.parse(req.body);
    res.json(await s.pontos.atualizar(id, body));
  }));
  r.delete('/pontos-risco/:id', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    await s.pontos.remover(id);
    res.status(204).send();
  }));
  r.get('/pontos-risco/:id/status', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    res.json(await s.pontos.status(id));
  }));

  r.post('/sensores', asyncHandler(async (req, res) => {
    const body = S.CriarSensorBody.parse(req.body);
    res.status(201).json(await s.sensores.criar(body));
  }));
  r.get('/sensores', asyncHandler(async (req, res) => {
    const filtro = S.ListarSensoresQuery.parse(req.query);
    res.json(await s.sensores.listar(filtro));
  }));
  r.patch('/sensores/:id', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    const { ativo } = S.AtualizarSensorBody.parse(req.body);
    res.json(await s.sensores.alterarAtivo(id, ativo));
  }));
  r.get('/sensores/:id/leituras', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    const { limite } = S.HistoricoQuery.parse(req.query);
    res.json(await s.sensores.historico(id, limite));
  }));

  r.post('/leituras', asyncHandler(async (req, res) => {
    const body = S.RegistrarLeituraBody.parse(req.body);
    const resultado = await s.leituras.registrar({
      ...body,
      registradaEm: body.registradaEm ? new Date(body.registradaEm) : undefined,
    });
    res.status(201).json(resultado);
  }));

  r.get('/alertas', asyncHandler(async (req, res) => {
    const q = S.ListarAlertasQuery.parse(req.query);
    const ativos = q.ativos === undefined ? undefined : q.ativos === 'true';
    res.json(await s.alertas.listar({ ativos, bairroId: q.bairroId }));
  }));

  r.post('/relatos', asyncHandler(async (req, res) => {
    const body = S.CriarRelatoBody.parse(req.body);
    const relato = await s.relatos.criar({
      ...body,
      pontoRiscoId: body.pontoRiscoId ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
    });
    res.status(201).json(relato);
  }));
  r.get('/relatos', asyncHandler(async (req, res) => {
    const filtro = S.ListarRelatosQuery.parse(req.query);
    res.json(await s.relatos.listar(filtro));
  }));
  r.patch('/relatos/:id/status', asyncHandler(async (req, res) => {
    const { id } = S.IdParam.parse(req.params);
    const { status } = S.ModerarRelatoBody.parse(req.body);
    res.json(await s.relatos.moderar(id, status));
  }));

  return r;
}
