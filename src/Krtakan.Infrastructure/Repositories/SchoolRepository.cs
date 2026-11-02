using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class SchoolRepository(AppDbContext context) : EfRepository<School>(context), ISchoolRepository
{
    public Task<School?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
    }
}
