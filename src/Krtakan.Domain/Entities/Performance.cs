using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Performance : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime UploadDate { get; set; }

    public int EventId { get; set; }
    public Event Event { get; set; } = null!;

    public int MediaId { get; set; }
    public Media Media { get; set; } = null!;
    public int RoundId { get; set; }
    public Round Round { get; set; } = null!;

    public ICollection<Scoring> Scorings { get; set; } = new List<Scoring>();

}
