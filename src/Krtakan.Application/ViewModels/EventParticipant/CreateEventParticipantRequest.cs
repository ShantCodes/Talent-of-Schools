using Krtakan.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Krtakan.Application.ViewModels.EventParticipant;

public record CreateEventParticipantRequest(
    [Required] string Title,
    [Required] string Author,
    [Required] int UserId,
    [Required] int EventId,
    int? DocumentId
);
