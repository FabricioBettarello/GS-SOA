using MonitoramentoOrbital.Api.Domain.Entities;

namespace MonitoramentoOrbital.Api.Domain.Interfaces;

public interface ISateliteRepository : IRepository<Satelite>
{
    Task<Satelite?> ObterComSensoresAsync(int id, CancellationToken ct = default);

    Task<Sensor?> ObterSensorAsync(int sateliteId, int sensorId, CancellationToken ct = default);
}
