using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class RoleRepository(AppDbContext context) : EfRepository<Role>(context), IRoleRepository
{
    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default) => Set.SingleOrDefaultAsync(role => role.Name == name, cancellationToken);
}
