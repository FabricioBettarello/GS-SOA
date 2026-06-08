using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Infrastructure.Data;

namespace MonitoramentoOrbital.Api.Infrastructure.Repositories;

public sealed class SateliteRepository : Repository<Satelite>, ISateliteRepository
{
    public SateliteRepository(MonitoramentoDbContext context) : base(context) { }

    public override async Task<IReadOnlyList<Satelite>> ListarAsync(CancellationToken ct = default) =>
        await DbSet.AsNoTracking().Include(s => s.Sensores).ToListAsync(ct);

    public async Task<Satelite?> ObterComSensoresAsync(int id, CancellationToken ct = default) =>
        await DbSet
            .Include(s => s.Sensores)
            .ThenInclude(se => se.Leituras)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<Sensor?> ObterSensorAsync(int sateliteId, int sensorId, CancellationToken ct = default) =>
        await Context.Sensores
            .Include(s => s.Satelite)
            .FirstOrDefaultAsync(s => s.Id == sensorId && s.SateliteId == sateliteId, ct);
}
