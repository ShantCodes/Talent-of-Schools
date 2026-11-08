using Krtakan.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Krtakan.Application.ViewModels.EventParticipant;

public record EventParticipantViewModel(
    int Id,
    string Title,
    string Author,
    int UserId,
    int EventId,
    int? DocumentId
)
{
    public string FullName { get; init; }
    public string Email { get; init; }
};