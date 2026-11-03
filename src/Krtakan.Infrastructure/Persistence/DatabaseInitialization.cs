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
        var adminEmail = seed.AdminEmail.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(seed.AdminPassword)) return;

        if (await context.Users.AnyAsync(user => user.Email == adminEmail)) return;

        var role = await context.Roles.SingleAsync(role => role.Name == RoleNames.Admin);
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        context.Users.Add(new User { Name = seed.AdminName, LastName = seed.AdminLastName, Email = adminEmail, PasswordHash = hasher.Hash(seed.AdminPassword), RoleId = role.Id, BirthDate = new DateOnly(2000, 1, 1), RegisterDate = DateTime.UtcNow, IsApproved = true });
        await context.SaveChangesAsync();

        if (seed.MediaFolders != null && seed.MediaFolders.Any())
        {
            foreach (var folderName in seed.MediaFolders)
            {
                var path = $"storage/media/{folderName.ToLower()}";
                Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), path));
            }

            if (!await context.MediaFolders.AnyAsync())
            {
                foreach (var folderName in seed.MediaFolders)
                {
                    context.MediaFolders.Add(new MediaFolder
                    {
                        Name = folderName,
                        Path = $"storage/media/{folderName.ToLower()}"
                    });
                }
                await context.SaveChangesAsync();
            }
        }
    }
}
