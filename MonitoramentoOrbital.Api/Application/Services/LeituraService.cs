using Microsoft.Extensions.Logging;
using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Application.Mapeamento;
using MonitoramentoOrbital.Api.Domain.Exceptions;
using MonitoramentoOrbital.Api.Domain.Interfaces;

namespace MonitoramentoOrbital.Api.Application.Services;

public sealed class LeituraService : ILeituraService
{
    private readonly ISateliteRepository _satelites;
    private readonly IAlertaRepository _alertas;
    private readonly IAvaliadorAlerta _avaliador;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<LeituraService> _logger;

    public LeituraService(
        ISateliteRepository satelites,
        IAlertaRepository alertas,
        IAvaliadorAlerta avaliador,
        IUnitOfWork uow,
        ILogger<LeituraService> logger)
    {
        _satelites = satelites;
        _alertas = alertas;
        _avaliador = avaliador;
        _uow = uow;
        _logger = logger;
    }

    public async Task<ResultadoLeituraResponse> RegistrarAsync(
        int sateliteId,
        int sensorId,
        RegistrarLeituraRequest request,
        CancellationToken ct = default)
    {
        var sensor = await _satelites.ObterSensorAsync(sateliteId, sensorId, ct)
            ?? throw new EntidadeNaoEncontradaException(
                "Sensor", $"satelite {sateliteId} / sensor {sensorId}");

        var instante = request.MedidoEm ?? DateTime.UtcNow;

        var leitura = sensor.RegistrarLeitura(request.Valor, instante);

        var alerta = _avaliador.Avaliar(sensor, leitura);
        if (alerta is not null)
        {
            await _alertas.AdicionarAsync(alerta, ct);
            _logger.LogWarning(
                "Alerta {Severidade} gerado para satelite {Satelite}: {Mensagem}",
                alerta.Severidade, sensor.Satelite?.Nome, alerta.Mensagem);
        }

        await _uow.SalvarAsync(ct);

        var alertaResponse = alerta is null ? null : MapeadorResposta.ParaResponse(alerta);
        return new ResultadoLeituraResponse(MapeadorResposta.ParaResponse(leitura, sensor), alertaResponse);
    }
}
