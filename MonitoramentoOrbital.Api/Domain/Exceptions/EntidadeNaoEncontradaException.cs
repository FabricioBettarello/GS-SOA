namespace MonitoramentoOrbital.Api.Domain.Exceptions;

public sealed class EntidadeNaoEncontradaException : DominioException
{
    public EntidadeNaoEncontradaException(string entidade, object chave)
        : base($"{entidade} com identificador '{chave}' nao foi encontrado(a).") { }
}
