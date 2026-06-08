using System.ComponentModel.DataAnnotations;
using MonitoramentoOrbital.Api.Domain.Enums;

namespace MonitoramentoOrbital.Api.Application.DTOs;

public sealed record CriarSensorRequest(
    TipoSensor Tipo,
    [Required] string Unidade,
    DirecaoLimite Direcao,
    double LimiteAtencao,
    double LimiteCritico);

public sealed record RegistrarLeituraRequest(
    double Valor,
    DateTime? MedidoEm);

public sealed record SensorResponse(
    int Id,
    string Tipo,
    string Unidade,
    string Direcao,
    double LimiteAtencao,
    double LimiteCritico,
    int TotalLeituras);

public sealed record LeituraResponse(
    int Id,
    int SensorId,
    double Valor,
    DateTime MedidoEm,
    string Classificacao);

public sealed record ResultadoLeituraResponse(
    LeituraResponse Leitura,
    AlertaResponse? AlertaGerado);
