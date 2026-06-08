using MonitoramentoOrbital.Api.Domain.Common;
using MonitoramentoOrbital.Api.Domain.Exceptions;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class Leitura : EntidadeBase
{
    public int SensorId { get; private set; }
    public Sensor? Sensor { get; private set; }

    public double Valor { get; private set; }

    public DateTime MedidoEm { get; private set; }

    private Leitura() { }

    public Leitura(Sensor sensor, double valor, DateTime medidoEm)
    {
        ArgumentNullException.ThrowIfNull(sensor);

        if (medidoEm > DateTime.UtcNow.AddMinutes(1))
            throw new LeituraInvalidaException(
                $"A data da leitura ({medidoEm:u}) nao pode estar no futuro.");

        if (double.IsNaN(valor) || double.IsInfinity(valor))
            throw new LeituraInvalidaException("O valor da leitura e numericamente invalido.");

        Sensor = sensor;
        SensorId = sensor.Id;
        Valor = valor;
        MedidoEm = medidoEm;
    }

    public TimeSpan Defasagem() => DateTime.UtcNow - MedidoEm;
}
