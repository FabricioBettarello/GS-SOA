using MonitoramentoOrbital.Api.Domain.Common;

namespace MonitoramentoOrbital.Api.Domain.Interfaces;

public interface IRepository<T> where T : EntidadeBase
{
    Task<T?> ObterPorIdAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<T>> ListarAsync(CancellationToken ct = default);

    Task AdicionarAsync(T entidade, CancellationToken ct = default);

    void Remover(T entidade);
}
