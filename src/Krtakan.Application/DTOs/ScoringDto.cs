namespace Krtakan.Application.DTOs;

public record CreateScoringRequest(
    int EventParticipantId,
    int JurorId,
    decimal Score,
    int? PerformanceId
)
{
    public bool IsValid => Score >= 1 && Score <= 5;
}

public record ScoringResponse(
    int Id,
    int EventParticipantId,
    int JurorId,
    decimal Score,
    int? PerformanceId
);
