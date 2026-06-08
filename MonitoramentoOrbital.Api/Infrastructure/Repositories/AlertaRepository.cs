using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Infrastructure.Data;

namespace MonitoramentoOrbital.Api.Infrastructure.Repositories;

public sealed class AlertaRepository : Repository<Alerta>, IAlertaRepository
{
    public AlertaRepository(MonitoramentoDbContext context) : base(context) { }

    public override async Task<IReadOnlyList<Alerta>> ListarAsync(CancellationToken ct = default) =>
        await DbSet.AsNoTracking()
            .Include(a => a.Satelite)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Alerta>> ConsultarAsync(
        DateTime inicio,
        DateTime fim,
        SeveridadeAlerta? severidadeMinima,
        CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking()
            .Include(a => a.Satelite)
            .Where(a => a.DataCriacao >= inicio && a.DataCriacao <= fim);

        if (severidadeMinima is not null)
            query = query.Where(a => a.Severidade >= severidadeMinima);

        return await query.OrderByDescending(a => a.DataCriacao).ToListAsync(ct);
    }

    public async Task<Alerta?> ObterComSateliteAsync(int id, CancellationToken ct = default) =>
        await DbSet.Include(a => a.Satelite).FirstOrDefaultAsync(a => a.Id == id, ct);
}
