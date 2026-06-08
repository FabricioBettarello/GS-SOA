using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Application.Mapeamento;
using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Exceptions;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Application.Services;

public sealed class SateliteService : ISateliteService
{
    private readonly ISateliteRepository _repositorio;
    private readonly IUnitOfWork _uow;

    public SateliteService(ISateliteRepository repositorio, IUnitOfWork uow)
    {
        _repositorio = repositorio;
        _uow = uow;
    }

    public async Task<IReadOnlyList<SateliteResponse>> ListarAsync(CancellationToken ct = default)
    {
        var satelites = await _repositorio.ListarAsync(ct);
        return satelites
            .OrderByDescending(s => s.PrioridadeMonitoramento())
            .Select(MapeadorResposta.ParaResponse)
            .ToList();
    }

    public async Task<SateliteResponse> ObterAsync(int id, CancellationToken ct = default)
    {
        var satelite = await _repositorio.ObterComSensoresAsync(id, ct)
            ?? throw new EntidadeNaoEncontradaException("Satelite", id);

        return MapeadorResposta.ParaResponse(satelite);
    }

    public async Task<SateliteResponse> CriarAsync(CriarSateliteRequest request, CancellationToken ct = default)
    {
        var posicao = new Coordenada(request.Latitude, request.Longitude, request.AltitudeKm);
        var satelite = CriarPorTipo(request, posicao);

        await _repositorio.AdicionarAsync(satelite, ct);
        await _uow.SalvarAsync(ct);

        return MapeadorResposta.ParaResponse(satelite);
    }

    public async Task<SateliteResponse> AtualizarStatusAsync(
        int id, AtualizarStatusRequest request, CancellationToken ct = default)
    {
        var satelite = await _repositorio.ObterComSensoresAsync(id, ct)
            ?? throw new EntidadeNaoEncontradaException("Satelite", id);

        if (!Enum.TryParse<StatusSatelite>(request.Status, ignoreCase: true, out var status))
            throw new DominioException(
                $"Status invalido: '{request.Status}'. Valores aceitos: {string.Join(", ", Enum.GetNames<StatusSatelite>())}.");

        satelite.AtualizarStatus(status);
        await _uow.SalvarAsync(ct);

        return MapeadorResposta.ParaResponse(satelite);
    }

    public async Task<SateliteResponse> ReposicionarAsync(
        int id, ReposicionarRequest request, CancellationToken ct = default)
    {
        var satelite = await _repositorio.ObterComSensoresAsync(id, ct)
            ?? throw new EntidadeNaoEncontradaException("Satelite", id);

        satelite.Reposicionar(new Coordenada(request.Latitude, request.Longitude, request.AltitudeKm));
        await _uow.SalvarAsync(ct);

        return MapeadorResposta.ParaResponse(satelite);
    }

    public async Task<SensorResponse> AdicionarSensorAsync(
        int sateliteId, CriarSensorRequest request, CancellationToken ct = default)
    {
        var satelite = await _repositorio.ObterComSensoresAsync(sateliteId, ct)
            ?? throw new EntidadeNaoEncontradaException("Satelite", sateliteId);

        var sensor = new Sensor(
            request.Tipo, request.Unidade, request.Direcao, request.LimiteAtencao, request.LimiteCritico);
        satelite.AdicionarSensor(sensor);

        await _uow.SalvarAsync(ct);

        return MapeadorResposta.ParaResponse(sensor);
    }

    private static Satelite CriarPorTipo(CriarSateliteRequest r, Coordenada posicao) => r.Tipo switch
    {
        TipoSateliteDto.Observacao => new SateliteObservacao(
            r.Nome, r.CodigoInternacional, posicao, r.DataLancamento, r.ParametroEspecifico),

        TipoSateliteDto.Comunicacao => new SateliteComunicacao(
            r.Nome, r.CodigoInternacional, posicao, r.DataLancamento, r.ParametroEspecifico),

        TipoSateliteDto.Meteorologico => new SateliteMeteorologico(
            r.Nome, r.CodigoInternacional, posicao, r.DataLancamento, r.ParametroEspecifico >= 1),

        _ => throw new DominioException($"Tipo de satelite nao suportado: {r.Tipo}.")
    };
}
