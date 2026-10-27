using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : EfRepository<User>(context), IUserRepository
{
    private IQueryable<User> Details => Set.Include(user => user.Role).Include(user => user.School);
    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default) => Set.AnyAsync(user => user.Email == email, cancellationToken);
    public Task<User?> GetByEmailWithDetailsAsync(string email, CancellationToken cancellationToken = default) => Details.SingleOrDefaultAsync(user => user.Email == email, cancellationToken);
    public Task<User?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default) => Details.SingleOrDefaultAsync(user => user.Id == id, cancellationToken);
    public async Task<IReadOnlyList<User>> ListPendingAsync(CancellationToken cancellationToken = default) => await Details.Where(user => !user.IsApproved).OrderBy(user => user.RegisterDate).ToListAsync(cancellationToken);
}
