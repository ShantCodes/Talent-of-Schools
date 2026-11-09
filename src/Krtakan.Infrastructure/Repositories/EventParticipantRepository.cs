using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace Krtakan.Infrastructure.Repositories;

public class EventParticipantRepository(AppDbContext context) : EfRepository<EventParticipant>(context), IEventParticipantRepository
{
    public async Task<PagedResult<EventParticipant>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return await base.ListAsync(p => p.EventId == eventId, pageNumber, pageSize, cancellationToken);
    }

    public async Task<EventParticipant?> GetEventParticipantByUserIdAndEventIdAsync(int userId, int eventId, CancellationToken cancellationToken = default)
    {
        return await Set.FirstOrDefaultAsync(p => p.UserId == userId && p.EventId == eventId, cancellationToken);
    }

    public async Task<PagedResult<EventParticipant>> GetParticipantsWithUserDetailsAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = Set.AsNoTracking()
            .Where(p => p.EventId == eventId)
            .Include(p => p.User);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<EventParticipant>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<List<EventParticipant>> GetParticipantsWithUserDetailsByIdsAsync(
    IEnumerable<int> participantIds,
    CancellationToken cancellationToken = default)
    {
        if (participantIds is null || !participantIds.Any())
            return new List<EventParticipant>();

        return await Set.AsNoTracking()
            .Where(p => participantIds.Contains(p.Id))
            .Include(p => p.User)
            .ToListAsync(cancellationToken);
    }
}