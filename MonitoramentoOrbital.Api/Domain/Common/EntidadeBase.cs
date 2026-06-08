namespace MonitoramentoOrbital.Api.Domain.Common;

public abstract class EntidadeBase
{
    public int Id { get; protected set; }

    public DateTime DataCriacao { get; protected set; } = DateTime.UtcNow;

    public TimeSpan Idade() => DateTime.UtcNow - DataCriacao;
}
