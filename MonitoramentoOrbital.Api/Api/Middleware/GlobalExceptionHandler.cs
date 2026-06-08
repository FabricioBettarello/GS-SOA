using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MonitoramentoOrbital.Api.Domain.Exceptions;

namespace MonitoramentoOrbital.Api.Api.Middleware;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, titulo) = exception switch
        {
            EntidadeNaoEncontradaException => (StatusCodes.Status404NotFound, "Recurso nao encontrado"),
            LeituraInvalidaException => (StatusCodes.Status422UnprocessableEntity, "Leitura invalida"),
            DominioException => (StatusCodes.Status400BadRequest, "Regra de negocio violada"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Requisicao invalida"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno inesperado")
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Falha nao tratada ao processar {Path}", context.Request.Path);
        else
            _logger.LogWarning("Requisicao rejeitada ({Status}): {Mensagem}", status, exception.Message);

        var problema = new ProblemDetails
        {
            Status = status,
            Title = titulo,
            Detail = status == StatusCodes.Status500InternalServerError
                ? "Ocorreu um erro inesperado. A equipe de operacoes foi notificada."
                : exception.Message,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(problema, cancellationToken);
        return true;
    }
}
