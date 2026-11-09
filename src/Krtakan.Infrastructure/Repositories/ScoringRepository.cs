using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Krtakan.Infrastructure.Repositories;

public class ScoringRepository(AppDbContext context) : EfRepository<Scoring>(context), IScoringRepository
{
    public async Task<IEnumerable<Scoring>> GetScoresByEventIdAsync(int eventId)
    {
        return await Set
            .Include(s => s.Participant)
            .Where(s => s.EventId == eventId)
            .ToListAsync();
    }
}
