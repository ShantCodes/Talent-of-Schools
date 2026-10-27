using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Media : BaseEntity
{
    public string Path { get; set; } = string.Empty;

    public int FormatId { get; set; }

    public MediaFormat Format { get; set; } = null!;

    public long Size { get; set; }

    public ICollection<Performance> Performances { get; set; } = new List<Performance>();
}
