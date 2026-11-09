using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Domain.Interfaces;

public interface IScoringRepository : IRepository<Scoring>
{
    Task<IEnumerable<Scoring>> GetScoresByEventIdAsync(int eventId);
}
