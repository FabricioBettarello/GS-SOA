using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Domain.Common;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Infrastructure.Data;

namespace MonitoramentoOrbital.Api.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : EntidadeBase
{
    protected readonly MonitoramentoDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(MonitoramentoDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public virtual async Task<T?> ObterPorIdAsync(int id, CancellationToken ct = default) =>
        await DbSet.FindAsync([id], ct);

    public virtual async Task<IReadOnlyList<T>> ListarAsync(CancellationToken ct = default) =>
        await DbSet.AsNoTracking().ToListAsync(ct);

    public virtual async Task AdicionarAsync(T entidade, CancellationToken ct = default) =>
        await DbSet.AddAsync(entidade, ct);

    public virtual void Remover(T entidade) => DbSet.Remove(entidade);
}
