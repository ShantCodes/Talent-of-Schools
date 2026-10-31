using Krtakan.Domain.Entities;

namespace Krtakan.Application.ViewModels.Event;

public record EventViewModel(
    int Id,
    string Name,
    string Description,
    DateTime StartDate,
    DateTime EndDate,
    DateOnly? MinBirthDate,
    DateOnly? MaxBirthDate
);
