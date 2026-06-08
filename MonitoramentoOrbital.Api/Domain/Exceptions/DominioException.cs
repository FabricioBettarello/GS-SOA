namespace MonitoramentoOrbital.Api.Domain.Exceptions;

public class DominioException : Exception
{
    public DominioException(string mensagem) : base(mensagem) { }

    public DominioException(string mensagem, Exception inner) : base(mensagem, inner) { }
}
