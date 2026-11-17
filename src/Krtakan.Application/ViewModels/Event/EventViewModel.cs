using Krtakan.Domain.Entities;

namespace Krtakan.Application.ViewModels.Event;

public record EventViewModel(
    int Id,
    string Name,
    string Description,
    DateTime StartDate,
    DateTime EndDate,
    DateOnly? MinBirthDate,
    DateOnly? MaxBirthDate,
    string? Title,
    string? Author,
    decimal? AverageScore,
    int? Rank
);

    public record EventParticipantScore(
    int Id,
    int EventId,
    int UserId,
    string? Title,
    string? Author,
    decimal? AverageScore
);
