using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Domain.Enums;

namespace MonitoramentoOrbital.Api.Application.Services;

public interface IAlertaService
{
    Task<IReadOnlyList<AlertaResponse>> ListarAsync(CancellationToken ct = default);

    Task<IReadOnlyList<AlertaResponse>> ConsultarAsync(
        DateTime? inicio,
        DateTime? fim,
        SeveridadeAlerta? severidadeMinima,
        CancellationToken ct = default);

    Task<AlertaResponse> ReconhecerAsync(int id, CancellationToken ct = default);
}
