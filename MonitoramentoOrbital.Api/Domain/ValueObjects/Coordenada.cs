using MonitoramentoOrbital.Api.Domain.Exceptions;

namespace MonitoramentoOrbital.Api.Domain.ValueObjects;

public sealed record Coordenada
{
    public double Latitude { get; }
    public double Longitude { get; }

    public double AltitudeKm { get; }

    public Coordenada(double latitude, double longitude, double altitudeKm)
    {
        if (latitude is < -90 or > 90)
            throw new DominioException($"Latitude invalida: {latitude}. Deve estar entre -90 e 90.");

        if (longitude is < -180 or > 180)
            throw new DominioException($"Longitude invalida: {longitude}. Deve estar entre -180 e 180.");

        if (altitudeKm <= 0)
            throw new DominioException($"Altitude invalida: {altitudeKm}. Deve ser maior que zero.");

        Latitude = latitude;
        Longitude = longitude;
        AltitudeKm = altitudeKm;
    }

    public string FaixaOrbital() => AltitudeKm switch
    {
        < 2_000 => "LEO (Orbita Baixa)",
        < 35_786 => "MEO (Orbita Media)",
        _ => "GEO (Orbita Geoestacionaria)"
    };

    public override string ToString() =>
        $"({Latitude:F2}, {Longitude:F2}) @ {AltitudeKm:F0} km";
}
