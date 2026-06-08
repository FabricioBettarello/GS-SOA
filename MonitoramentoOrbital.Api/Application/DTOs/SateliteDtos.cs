using System.ComponentModel.DataAnnotations;

namespace MonitoramentoOrbital.Api.Application.DTOs;

public enum TipoSateliteDto
{
    Observacao = 1,
    Comunicacao = 2,
    Meteorologico = 3
}

public sealed record CriarSateliteRequest(
    [Required] string Nome,
    [Required] string CodigoInternacional,
    TipoSateliteDto Tipo,
    double Latitude,
    double Longitude,
    double AltitudeKm,
    DateTime DataLancamento,
    double ParametroEspecifico);

public sealed record AtualizarStatusRequest(string Status);

public sealed record ReposicionarRequest(double Latitude, double Longitude, double AltitudeKm);

public sealed record SateliteResponse(
    int Id,
    string Nome,
    string CodigoInternacional,
    string Tipo,
    string Status,
    string Missao,
    int PrioridadeMonitoramento,
    string Posicao,
    string FaixaOrbital,
    DateTime DataLancamento,
    int AnosEmOrbita,
    IReadOnlyList<SensorResponse> Sensores);
