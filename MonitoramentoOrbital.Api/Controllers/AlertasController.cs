using Microsoft.AspNetCore.Mvc;
using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Application.Services;
using MonitoramentoOrbital.Api.Domain.Enums;

namespace MonitoramentoOrbital.Api.Controllers;

[ApiController]
[Route("api/alertas")]
[Produces("application/json")]
public sealed class AlertasController : ControllerBase
{
    private readonly IAlertaService _alertas;

    public AlertasController(IAlertaService alertas) => _alertas = alertas;

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AlertaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken ct) =>
        Ok(await _alertas.ListarAsync(ct));

    [HttpGet("historico")]
    [ProducesResponseType(typeof(IReadOnlyList<AlertaResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Historico(
        [FromQuery] DateTime? inicio,
        [FromQuery] DateTime? fim,
        [FromQuery] SeveridadeAlerta? severidadeMinima,
        CancellationToken ct) =>
        Ok(await _alertas.ConsultarAsync(inicio, fim, severidadeMinima, ct));

    [HttpPost("{id:int}/reconhecer")]
    [ProducesResponseType(typeof(AlertaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reconhecer(int id, CancellationToken ct) =>
        Ok(await _alertas.ReconhecerAsync(id, ct));
}
