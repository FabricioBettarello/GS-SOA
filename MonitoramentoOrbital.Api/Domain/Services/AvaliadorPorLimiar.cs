using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Interfaces;

namespace MonitoramentoOrbital.Api.Domain.Services;

public sealed class AvaliadorPorLimiar : IAvaliadorAlerta
{
    public Alerta? Avaliar(Sensor sensor, Leitura leitura)
    {
        ArgumentNullException.ThrowIfNull(sensor);
        ArgumentNullException.ThrowIfNull(leitura);

        var severidade = sensor.Classificar(leitura.Valor);

        if (severidade == SeveridadeAlerta.Informativo)
            return null;

        var satelite = sensor.Satelite;

        if (satelite is not null
            && severidade == SeveridadeAlerta.Atencao
            && satelite.PrioridadeMonitoramento() >= 8)
        {
            severidade = SeveridadeAlerta.Critico;
        }

        var operador = sensor.Direcao == Domain.Enums.DirecaoLimite.Maior ? ">=" : "<=";
        var mensagem =
            $"Sensor de {sensor.Tipo} registrou {leitura.Valor:F2} {sensor.Unidade} " +
            $"(atencao {operador} {sensor.LimiteAtencao:F2}, critico {operador} {sensor.LimiteCritico:F2}).";

        return new Alerta(satelite!, leitura, severidade, mensagem);
    }
}
