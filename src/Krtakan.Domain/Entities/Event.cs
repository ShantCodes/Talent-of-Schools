using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Event : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateOnly? MinBirthDate { get; set; }
    public DateOnly? MaxBirthDate { get; set; }
    public ICollection<Performance> Performances { get; set; } = new List<Performance>();
}
