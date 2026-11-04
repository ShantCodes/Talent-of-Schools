using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Media : BaseEntity
{
    public int FolderId { get; set; }
    public MediaFolder Folder { get; set; } = null!;

    public int FormatId { get; set; }
    public MediaFormat Format { get; set; } = null!;

    public long Size { get; set; }
    public string RelativePath { get; set; } = string.Empty;

    public ICollection<Performance> Performances { get; set; } = new List<Performance>();
}
