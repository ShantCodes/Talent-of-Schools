using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class MediaFormat : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<Media> MediaItems { get; set; } = new List<Media>();
}
