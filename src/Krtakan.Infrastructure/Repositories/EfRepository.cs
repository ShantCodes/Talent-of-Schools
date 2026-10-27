using System.Linq.Expressions;
using Krtakan.Domain.Common;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class EfRepository<T>(AppDbContext context) : IRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext Context = context;
    protected DbSet<T> Set => Context.Set<T>();
    public Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default) => Set.FindAsync([id], cancellationToken).AsTask();
    public async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default) => await Set.AsNoTracking().ToListAsync(cancellationToken);
    public Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) => Set.AnyAsync(predicate, cancellationToken);
    public Task AddAsync(T entity, CancellationToken cancellationToken = default) => Set.AddAsync(entity, cancellationToken).AsTask();
    public void Update(T entity) => Set.Update(entity);
    public void Remove(T entity) => Set.Remove(entity);
}
