using Krtakan.Domain.Entities;

namespace Krtakan.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailWithDetailsAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> ListPendingAsync(CancellationToken cancellationToken = default);
}
