using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Domain.Interfaces;

public interface ISchoolRepository : IRepository<School>
{
    Task<School?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
