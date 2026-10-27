using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class Scoring : BaseEntity
{
    public int PerformanceId { get; set; }

    public Performance Performance { get; set; } = null!;

    public int JurorId { get; set; }

    public User Juror { get; set; } = null!;

    public decimal Score { get; set; }
}
