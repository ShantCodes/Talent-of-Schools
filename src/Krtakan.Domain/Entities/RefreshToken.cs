using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public bool IsRevoked { get; set; } = false;

    public int UserId { get; set; }
    public User? User { get; set; }
}
