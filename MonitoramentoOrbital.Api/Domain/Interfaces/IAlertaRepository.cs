using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Enums;

namespace MonitoramentoOrbital.Api.Domain.Interfaces;

public interface IAlertaRepository : IRepository<Alerta>
{
    Task<IReadOnlyList<Alerta>> ConsultarAsync(
        DateTime inicio,
        DateTime fim,
        SeveridadeAlerta? severidadeMinima,
        CancellationToken ct = default);

    Task<Alerta?> ObterComSateliteAsync(int id, CancellationToken ct = default);
}
