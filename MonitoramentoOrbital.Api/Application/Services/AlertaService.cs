using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Application.Mapeamento;
using MonitoramentoOrbital.Api.Domain.Enums;
using MonitoramentoOrbital.Api.Domain.Exceptions;
using MonitoramentoOrbital.Api.Domain.Interfaces;

namespace MonitoramentoOrbital.Api.Application.Services;

public sealed class AlertaService : IAlertaService
{
    private readonly IAlertaRepository _repositorio;
    private readonly IUnitOfWork _uow;

    public AlertaService(IAlertaRepository repositorio, IUnitOfWork uow)
    {
        _repositorio = repositorio;
        _uow = uow;
    }

    public async Task<IReadOnlyList<AlertaResponse>> ListarAsync(CancellationToken ct = default)
    {
        var alertas = await _repositorio.ListarAsync(ct);
        return alertas.Select(MapeadorResposta.ParaResponse).ToList();
    }

    public async Task<IReadOnlyList<AlertaResponse>> ConsultarAsync(
        DateTime? inicio,
        DateTime? fim,
        SeveridadeAlerta? severidadeMinima,
        CancellationToken ct = default)
    {
        var fimEfetivo = fim ?? DateTime.UtcNow;
        var inicioEfetivo = inicio ?? fimEfetivo.AddDays(-7);

        if (inicioEfetivo > fimEfetivo)
            throw new DominioException("A data inicial nao pode ser posterior a data final.");

        var alertas = await _repositorio.ConsultarAsync(inicioEfetivo, fimEfetivo, severidadeMinima, ct);
        return alertas.Select(MapeadorResposta.ParaResponse).ToList();
    }

    public async Task<AlertaResponse> ReconhecerAsync(int id, CancellationToken ct = default)
    {
        var alerta = await _repositorio.ObterComSateliteAsync(id, ct)
            ?? throw new EntidadeNaoEncontradaException("Alerta", id);

        alerta.Reconhecer();
        await _uow.SalvarAsync(ct);

        return MapeadorResposta.ParaResponse(alerta);
    }
}
