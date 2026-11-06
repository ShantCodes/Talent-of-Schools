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
}