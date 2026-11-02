using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class MediaFolder : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Path { get; set; }
    public ICollection<Media> MediaItems { get; set; } = new List<Media>();
}
