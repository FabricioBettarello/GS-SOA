using MonitoramentoOrbital.Api.Application.DTOs;

namespace MonitoramentoOrbital.Api.Application.Services;

public interface ISateliteService
{
    Task<IReadOnlyList<SateliteResponse>> ListarAsync(CancellationToken ct = default);

    Task<SateliteResponse> ObterAsync(int id, CancellationToken ct = default);

    Task<SateliteResponse> CriarAsync(CriarSateliteRequest request, CancellationToken ct = default);

    Task<SateliteResponse> AtualizarStatusAsync(int id, AtualizarStatusRequest request, CancellationToken ct = default);

    Task<SateliteResponse> ReposicionarAsync(int id, ReposicionarRequest request, CancellationToken ct = default);

    Task<SensorResponse> AdicionarSensorAsync(int sateliteId, CriarSensorRequest request, CancellationToken ct = default);
}
