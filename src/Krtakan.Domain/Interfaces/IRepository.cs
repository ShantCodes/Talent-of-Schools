using System.Linq.Expressions;
using Krtakan.Domain.Common;

namespace Krtakan.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<T>> ListAsync(
        Expression<Func<T, bool>>? predicate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);

    void Remove(T entity);
}
