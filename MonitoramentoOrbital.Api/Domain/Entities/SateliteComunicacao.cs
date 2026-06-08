using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class SateliteComunicacao : Satelite
{
    public double LarguraBandaGhz { get; private set; }

    private SateliteComunicacao() { }

    public SateliteComunicacao(
        string nome,
        string codigoInternacional,
        Coordenada posicao,
        DateTime dataLancamento,
        double larguraBandaGhz)
        : base(nome, codigoInternacional, posicao, dataLancamento)
    {
        LarguraBandaGhz = larguraBandaGhz;
    }

    public override string DescreverMissao() =>
        $"Telecomunicacoes com {LarguraBandaGhz:F1} GHz de banda.";

    public override int PrioridadeBase() => 6;
}
