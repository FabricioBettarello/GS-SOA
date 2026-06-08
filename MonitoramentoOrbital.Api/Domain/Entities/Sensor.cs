using MonitoramentoOrbital.Api.Domain.Common;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Exceptions;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class Sensor : EntidadeBase
{
    private readonly List<Leitura> _leituras = new();

    public TipoSensor Tipo { get; private set; }

    public string Unidade { get; private set; } = string.Empty;

    public DirecaoLimite Direcao { get; private set; }

    public double LimiteAtencao { get; private set; }

    public double LimiteCritico { get; private set; }

    public int SateliteId { get; private set; }
    public Satelite? Satelite { get; private set; }

    public IReadOnlyCollection<Leitura> Leituras => _leituras.AsReadOnly();

    private Sensor() { }

    public Sensor(
        TipoSensor tipo,
        string unidade,
        DirecaoLimite direcao,
        double limiteAtencao,
        double limiteCritico)
    {
        if (string.IsNullOrWhiteSpace(unidade))
            throw new DominioException("A unidade de medida do sensor e obrigatoria.");

        var coerente = direcao == DirecaoLimite.Maior
            ? limiteCritico > limiteAtencao
            : limiteCritico < limiteAtencao;

        if (!coerente)
            throw new DominioException(
                $"Limites incoerentes para a direcao {direcao}: " +
                $"atencao={limiteAtencao}, critico={limiteCritico}.");

        Tipo = tipo;
        Unidade = unidade.Trim();
        Direcao = direcao;
        LimiteAtencao = limiteAtencao;
        LimiteCritico = limiteCritico;
    }

    public Leitura RegistrarLeitura(double valor, DateTime instante)
    {
        var leitura = new Leitura(this, valor, instante);
        _leituras.Add(leitura);
        return leitura;
    }

    public SeveridadeAlerta Classificar(double valor)
    {
        var atingiuCritico = Direcao == DirecaoLimite.Maior
            ? valor >= LimiteCritico
            : valor <= LimiteCritico;

        if (atingiuCritico) return SeveridadeAlerta.Emergencia;

        var atingiuAtencao = Direcao == DirecaoLimite.Maior
            ? valor >= LimiteAtencao
            : valor <= LimiteAtencao;

        return atingiuAtencao ? SeveridadeAlerta.Atencao : SeveridadeAlerta.Informativo;
    }
}
