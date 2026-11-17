using Krtakan.Domain.Entities;


namespace Krtakan.Domain.Interfaces;

public interface IEventRepository : IRepository<Event>
{
    Task<List<EventParticipant>> GetParticipantsWithScoresAsync(
        List<int> eventIds,
        CancellationToken cancellationToken = default);
}
