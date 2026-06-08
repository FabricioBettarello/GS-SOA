using MonitoramentoOrbital.Api.Application.DTOs;

namespace MonitoramentoOrbital.Api.Application.Services;

public interface ILeituraService
{
    Task<ResultadoLeituraResponse> RegistrarAsync(
        int sateliteId,
        int sensorId,
        RegistrarLeituraRequest request,
        CancellationToken ct = default);
}
