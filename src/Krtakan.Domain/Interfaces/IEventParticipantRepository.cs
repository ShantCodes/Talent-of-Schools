using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Domain.Interfaces;

public interface IEventParticipantRepository : IRepository<EventParticipant>
{
    Task<PagedResult<EventParticipant>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}
