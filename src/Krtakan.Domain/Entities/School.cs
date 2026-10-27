using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
}
