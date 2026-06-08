using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class SateliteObservacao : Satelite
{
    public double ResolucaoMetros { get; private set; }

    private SateliteObservacao() { }

    public SateliteObservacao(
        string nome,
        string codigoInternacional,
        Coordenada posicao,
        DateTime dataLancamento,
        double resolucaoMetros)
        : base(nome, codigoInternacional, posicao, dataLancamento)
    {
        ResolucaoMetros = resolucaoMetros;
    }

    public override string DescreverMissao() =>
        $"Observacao terrestre com resolucao de {ResolucaoMetros:F1} m/pixel.";

    public override int PrioridadeBase() => 7;
}
