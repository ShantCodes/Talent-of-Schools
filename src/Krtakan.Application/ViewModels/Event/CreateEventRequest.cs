using Krtakan.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Krtakan.Application.ViewModels.Event;

public record CreateEventRequest(
    [Required] string Name,
    [Required] string Description,
    [Required] DateTime StartDate,
    [Required] DateTime EndDate,
    DateOnly? MinBirthDate,
    DateOnly? MaxBirthDate
); // Wait, is IRequest from something?
