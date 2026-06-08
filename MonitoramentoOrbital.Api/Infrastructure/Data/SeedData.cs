using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Infrastructure.Data;

public static class SeedData
{
    public static async Task InicializarAsync(MonitoramentoDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Satelites.AnyAsync())
            return;

        var aqua = new SateliteObservacao(
            "Aqua-EOS", "2002-022A",
            new Coordenada(-23.5, -46.6, 705),
            new DateTime(2002, 5, 4, 0, 0, 0, DateTimeKind.Utc),
            resolucaoMetros: 0.5);
        aqua.AdicionarSensor(new Sensor(TipoSensor.Temperatura, "C", DirecaoLimite.Maior, 60, 85));
        aqua.AdicionarSensor(new Sensor(TipoSensor.Bateria, "%", DirecaoLimite.Menor, 30, 15));

        var starlink = new SateliteComunicacao(
            "Starlink-1130", "2020-001K",
            new Coordenada(10.0, -55.0, 550),
            new DateTime(2020, 1, 7, 0, 0, 0, DateTimeKind.Utc),
            larguraBandaGhz: 12.5);
        starlink.AdicionarSensor(new Sensor(TipoSensor.Proximidade, "km", DirecaoLimite.Menor, 5, 1));
        starlink.AdicionarSensor(new Sensor(TipoSensor.Radiacao, "mSv", DirecaoLimite.Maior, 50, 100));

        var goes = new SateliteMeteorologico(
            "GOES-16", "2016-071A",
            new Coordenada(0.0, -75.2, 35786),
            new DateTime(2016, 11, 19, 0, 0, 0, DateTimeKind.Utc),
            monitoraClimaEspacial: true);
        goes.AdicionarSensor(new Sensor(TipoSensor.Radiacao, "mSv", DirecaoLimite.Maior, 40, 90));
        goes.AdicionarSensor(new Sensor(TipoSensor.Temperatura, "C", DirecaoLimite.Maior, 55, 80));

        await context.Satelites.AddRangeAsync(aqua, starlink, goes);
        await context.SaveChangesAsync();
    }
}
