using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Round : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ICollection<Performance> Performances { get; set; } = new List<Performance>();
}
