using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Domain.Common;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : EfRepository<User>(context), IUserRepository
{
    private IQueryable<User> Details => Set.Include(user => user.Roles).Include(user => user.School).Include(user => user.ProfilePicture).Include(user => user.Roles);
    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default) => Set.AnyAsync(user => user.Email == email, cancellationToken);
    public Task<bool> PhoneExistsAsync(string phone, CancellationToken cancellationToken = default) => Set.AnyAsync(user => user.PhoneNumber == phone, cancellationToken);
    public Task<User?> GetByEmailWithDetailsAsync(string email, CancellationToken cancellationToken = default) => Details.SingleOrDefaultAsync(user => user.Email == email, cancellationToken);

    public Task<User?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        var test = Details.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        return test;
    }
    public async Task<PagedResult<User>> ListUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = Details.OrderBy(user => user.RegisterDate);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<PagedResult<User>> ListApprovedUsersAsync(
    int pageNumber,
    int pageSize,
    CancellationToken cancellationToken = default)
    {
        var query = Details.Where(status => status.IsApproved).OrderBy(user => user.RegisterDate);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(items, totalCount, pageNumber, pageSize);
    }
    public async Task<PagedResult<User>> ListPendingAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = Details.Where(user => !user.IsApproved).OrderBy(user => user.RegisterDate);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<PagedResult<User>> SearchUsersAsync(
        string input,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = Details.Where(user =>
            user.Email.Contains(input) ||
            user.PhoneNumber.Contains(input) ||
            user.Name.Contains(input) ||
            user.LastName.Contains(input))
            .OrderBy(user => user.RegisterDate);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(items, totalCount, pageNumber, pageSize);
    }
}
