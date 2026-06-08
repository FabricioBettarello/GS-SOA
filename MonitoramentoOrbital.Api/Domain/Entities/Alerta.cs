using MonitoramentoOrbital.Api.Domain.Common;
using MonitoramentoOrbital.Api.Domain.Enums;

namespace MonitoramentoOrbital.Api.Domain.Entities;

public sealed class Alerta : EntidadeBase
{
    public int SateliteId { get; private set; }
    public Satelite? Satelite { get; private set; }

    public int LeituraId { get; private set; }
    public Leitura? Leitura { get; private set; }

    public SeveridadeAlerta Severidade { get; private set; }

    public string Mensagem { get; private set; } = string.Empty;

    public bool Reconhecido { get; private set; }
    public DateTime? ReconhecidoEm { get; private set; }

    private Alerta() { }

    public Alerta(Satelite satelite, Leitura leitura, SeveridadeAlerta severidade, string mensagem)
    {
        ArgumentNullException.ThrowIfNull(satelite);
        ArgumentNullException.ThrowIfNull(leitura);

        Satelite = satelite;
        SateliteId = satelite.Id;
        Leitura = leitura;
        LeituraId = leitura.Id;
        Severidade = severidade;
        Mensagem = mensagem;
    }

    public void Reconhecer()
    {
        if (Reconhecido) return;
        Reconhecido = true;
        ReconhecidoEm = DateTime.UtcNow;
    }
}
