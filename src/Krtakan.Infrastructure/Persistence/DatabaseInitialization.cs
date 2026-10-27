using Krtakan.Application.Abstractions;
using Krtakan.Application.Options;
using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Krtakan.Infrastructure.Persistence;

public static class DatabaseInitialization
{
    public static async Task ApplyMigrationsAndSeedAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        var seed = scope.ServiceProvider.GetRequiredService<IOptions<SeedOptions>>().Value;
        if (string.IsNullOrWhiteSpace(seed.AdminEmail) || string.IsNullOrWhiteSpace(seed.AdminPassword) || await context.Users.AnyAsync(user => user.Email == seed.AdminEmail.ToLowerInvariant())) return;
        var role = await context.Roles.SingleAsync(role => role.Name == RoleNames.Admin);
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        context.Users.Add(new User { Name = seed.AdminName, LastName = seed.AdminLastName, Email = seed.AdminEmail.ToLowerInvariant(), PasswordHash = hasher.Hash(seed.AdminPassword), RoleId = role.Id, BirthDate = new DateOnly(2000, 1, 1), RegisterDate = DateTime.UtcNow, IsApproved = true });
        await context.SaveChangesAsync();
    }
}
