using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class SateliteMeteorologico : Satelite
{
    public bool MonitoraClimaEspacial { get; private set; }

    private SateliteMeteorologico() { }

    public SateliteMeteorologico(
        string nome,
        string codigoInternacional,
        Coordenada posicao,
        DateTime dataLancamento,
        bool monitoraClimaEspacial)
        : base(nome, codigoInternacional, posicao, dataLancamento)
    {
        MonitoraClimaEspacial = monitoraClimaEspacial;
    }

    public override string DescreverMissao() =>
        MonitoraClimaEspacial
            ? "Meteorologia e monitoramento de clima espacial (tempestades solares)."
            : "Meteorologia e previsao do tempo terrestre.";

    public override int PrioridadeBase() => 8;

    public override int PrioridadeMonitoramento()
    {
        var bonus = MonitoraClimaEspacial ? 1 : 0;
        return Math.Clamp(base.PrioridadeMonitoramento() + bonus, 0, 10);
    }
}
