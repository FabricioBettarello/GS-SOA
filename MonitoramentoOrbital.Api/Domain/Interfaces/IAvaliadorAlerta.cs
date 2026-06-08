using MonitoramentoOrbital.Api.Domain.Entities;

namespace MonitoramentoOrbital.Api.Domain.Interfaces;

public interface IAvaliadorAlerta
{
    Alerta? Avaliar(Sensor sensor, Leitura leitura);
}
