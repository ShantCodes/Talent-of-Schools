using System.Linq.Expressions;
using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class EventRepository(AppDbContext context) : EfRepository<Event>(context), IEventRepository
{
    public async Task<PagedResult<Event>> ListAsync(
        Expression<Func<Event, bool>>? predicate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = Set.AsNoTracking();
        if (predicate != null)
        {
            query = query.Where(predicate);
        }
        query = query.Where(e => !e.IsDeleted);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Event>(items, totalCount, pageNumber, pageSize);
    }
}
