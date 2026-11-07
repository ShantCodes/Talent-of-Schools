using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using System.Collections.Generic;

namespace Krtakan.Domain.Entities;

public class EventParticipant : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
    public int? DocumentId { get; set; }
    public Media? Document { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; }
    public ICollection<Scoring> Scorings { get; set; } = new List<Scoring>();
}
