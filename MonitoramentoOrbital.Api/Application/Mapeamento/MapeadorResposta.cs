using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Domain.Entities;

namespace MonitoramentoOrbital.Api.Application.Mapeamento;

public static class MapeadorResposta
{
    public static SateliteResponse ParaResponse(Satelite s) => new(
        s.Id,
        s.Nome,
        s.CodigoInternacional,
        s.GetType().Name,
        s.Status.ToString(),
        s.DescreverMissao(),
        s.PrioridadeMonitoramento(),
        s.Posicao.ToString(),
        s.Posicao.FaixaOrbital(),
        s.DataLancamento,
        s.AnosEmOrbita(),
        s.Sensores.Select(ParaResponse).ToList());

    public static SensorResponse ParaResponse(Sensor sensor) => new(
        sensor.Id,
        sensor.Tipo.ToString(),
        sensor.Unidade,
        sensor.Direcao.ToString(),
        sensor.LimiteAtencao,
        sensor.LimiteCritico,
        sensor.Leituras.Count);

    public static LeituraResponse ParaResponse(Leitura l, Sensor sensor) => new(
        l.Id,
        l.SensorId,
        l.Valor,
        l.MedidoEm,
        sensor.Classificar(l.Valor).ToString());

    public static AlertaResponse ParaResponse(Alerta a) => new(
        a.Id,
        a.SateliteId,
        a.Satelite?.Nome ?? "(desconhecido)",
        a.LeituraId,
        a.Severidade.ToString(),
        a.Mensagem,
        a.Reconhecido,
        a.ReconhecidoEm,
        a.DataCriacao);
}
