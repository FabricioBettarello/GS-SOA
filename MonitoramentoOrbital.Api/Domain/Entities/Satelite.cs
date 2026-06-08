using MonitoramentoOrbital.Api.Domain.Common;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Exceptions;
using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public abstract class Satelite : EntidadeBase
{
    private readonly List<Sensor> _sensores = new();

    public string Nome { get; private set; } = string.Empty;

    public string CodigoInternacional { get; private set; } = string.Empty;

    public StatusSatelite Status { get; private set; } = StatusSatelite.Operacional;

    public Coordenada Posicao { get; private set; } = null!;

    public DateTime DataLancamento { get; private set; }

    public IReadOnlyCollection<Sensor> Sensores => _sensores.AsReadOnly();

    protected Satelite() { }

    protected Satelite(string nome, string codigoInternacional, Coordenada posicao, DateTime dataLancamento)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new DominioException("O nome do satelite e obrigatorio.");

        if (string.IsNullOrWhiteSpace(codigoInternacional))
            throw new DominioException("O codigo internacional (COSPAR) e obrigatorio.");

        if (dataLancamento > DateTime.UtcNow)
            throw new DominioException("A data de lancamento nao pode estar no futuro.");

        Nome = nome.Trim();
        CodigoInternacional = codigoInternacional.Trim().ToUpperInvariant();
        Posicao = posicao;
        DataLancamento = dataLancamento;
    }

    public abstract string DescreverMissao();

    public abstract int PrioridadeBase();

    public virtual int PrioridadeMonitoramento()
    {
        var ajusteStatus = Status switch
        {
            StatusSatelite.Degradado => 3,
            StatusSatelite.EmManutencao => 1,
            StatusSatelite.Inativo => -5,
            _ => 0
        };

        return Math.Clamp(PrioridadeBase() + ajusteStatus, 0, 10);
    }

    public void AdicionarSensor(Sensor sensor)
    {
        ArgumentNullException.ThrowIfNull(sensor);

        if (_sensores.Any(s => s.Tipo == sensor.Tipo))
            throw new DominioException(
                $"O satelite '{Nome}' ja possui um sensor do tipo {sensor.Tipo}.");

        _sensores.Add(sensor);
    }

    public void AtualizarStatus(StatusSatelite novoStatus) => Status = novoStatus;

    public void Reposicionar(Coordenada novaPosicao) =>
        Posicao = novaPosicao ?? throw new DominioException("A nova posicao e obrigatoria.");

    public int AnosEmOrbita() =>
        (int)((DateTime.UtcNow - DataLancamento).TotalDays / 365.25);
}
