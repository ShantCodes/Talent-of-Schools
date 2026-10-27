using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class CompRound : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public ICollection<Performance> Performances { get; set; } = new List<Performance>();
}
