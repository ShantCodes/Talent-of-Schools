using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class EventParticipantRepository(AppDbContext context) : EfRepository<EventParticipant>(context), IEventParticipantRepository
{
}
