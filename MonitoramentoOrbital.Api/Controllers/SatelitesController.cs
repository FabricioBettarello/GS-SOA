using Microsoft.AspNetCore.Mvc;
using MonitoramentoOrbital.Api.Application.DTOs;
using MonitoramentoOrbital.Api.Application.Services;

namespace MonitoramentoOrbital.Api.Controllers;

[ApiController]
[Route("api/satelites")]
[Produces("application/json")]
public sealed class SatelitesController : ControllerBase
{
    private readonly ISateliteService _satelites;
    private readonly ILeituraService _leituras;

    public SatelitesController(ISateliteService satelites, ILeituraService leituras)
    {
        _satelites = satelites;
        _leituras = leituras;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SateliteResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken ct) =>
        Ok(await _satelites.ListarAsync(ct));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SateliteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obter(int id, CancellationToken ct) =>
        Ok(await _satelites.ObterAsync(id, ct));

    [HttpPost]
    [ProducesResponseType(typeof(SateliteResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarSateliteRequest request, CancellationToken ct)
    {
        var criado = await _satelites.CriarAsync(request, ct);
        return CreatedAtAction(nameof(Obter), new { id = criado.Id }, criado);
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(SateliteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarStatus(
        int id, [FromBody] AtualizarStatusRequest request, CancellationToken ct) =>
        Ok(await _satelites.AtualizarStatusAsync(id, request, ct));

    [HttpPatch("{id:int}/posicao")]
    [ProducesResponseType(typeof(SateliteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reposicionar(
        int id, [FromBody] ReposicionarRequest request, CancellationToken ct) =>
        Ok(await _satelites.ReposicionarAsync(id, request, ct));

    [HttpPost("{id:int}/sensores")]
    [ProducesResponseType(typeof(SensorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdicionarSensor(
        int id, [FromBody] CriarSensorRequest request, CancellationToken ct)
    {
        var sensor = await _satelites.AdicionarSensorAsync(id, request, ct);
        return CreatedAtAction(nameof(Obter), new { id }, sensor);
    }

    [HttpPost("{sateliteId:int}/sensores/{sensorId:int}/leituras")]
    [ProducesResponseType(typeof(ResultadoLeituraResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> RegistrarLeitura(
        int sateliteId, int sensorId, [FromBody] RegistrarLeituraRequest request, CancellationToken ct)
    {
        var resultado = await _leituras.RegistrarAsync(sateliteId, sensorId, request, ct);
        return StatusCode(StatusCodes.Status201Created, resultado);
    }
}
