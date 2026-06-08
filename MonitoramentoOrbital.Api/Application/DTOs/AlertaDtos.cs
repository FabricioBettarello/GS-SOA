namespace MonitoramentoOrbital.Api.Application.DTOs;

public sealed record AlertaResponse(
    int Id,
    int SateliteId,
    string SateliteNome,
    int LeituraId,
    string Severidade,
    string Mensagem,
    bool Reconhecido,
    DateTime? ReconhecidoEm,
    DateTime DataCriacao);
