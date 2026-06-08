namespace MonitoramentoOrbital.Api.Domain.Exceptions;

public sealed class LeituraInvalidaException : DominioException
{
    public LeituraInvalidaException(string mensagem) : base(mensagem) { }
}
