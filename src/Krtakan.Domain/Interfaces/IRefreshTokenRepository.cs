using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;

namespace Krtakan.Domain.Interfaces;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
}
