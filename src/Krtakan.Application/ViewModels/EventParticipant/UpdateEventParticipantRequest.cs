using Krtakan.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Krtakan.Application.ViewModels.EventParticipant;

public record UpdateEventParticipantRequest(
    [Required] string Title,
    [Required] string Author,
    int? DocumentId
);
