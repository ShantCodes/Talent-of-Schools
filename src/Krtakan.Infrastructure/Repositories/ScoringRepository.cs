using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Krtakan.Infrastructure.Repositories;

public class ScoringRepository(AppDbContext context) : EfRepository<Scoring>(context), IScoringRepository
{
}
