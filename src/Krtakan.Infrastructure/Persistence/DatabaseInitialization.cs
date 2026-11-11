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

        await SeedMediaFoldersAsync(context, seed);

        var adminEmail = seed.AdminEmail.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(seed.AdminPassword)) return;

        if (await context.Users.AnyAsync(user => user.Email == adminEmail)) return;

        // Seed Roles
        var rolesToSeed = new[] { RoleNames.Admin, RoleNames.Student, RoleNames.Juror };
        foreach (var roleName in rolesToSeed)
        {
            if (!await context.Roles.AnyAsync(r => r.Name == roleName))
            {
                context.Roles.Add(new Role { Name = roleName });
            }
        }

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var adminRoles = new List<Role>();
        foreach (var roleName in seed.AdminRoles)
        {
            var role = await context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role != null)
            {
                adminRoles.Add(role);
            }
        }

        context.Users.Add(new User
        {
            Name = seed.AdminName,
            LastName = seed.AdminLastName,
            Email = adminEmail,
            PasswordHash = hasher.Hash(seed.AdminPassword),
            Roles = adminRoles,
            BirthDate = new DateOnly(2000, 1, 1),
            RegisterDate = DateTime.UtcNow,
            IsApproved = true
        });
        await context.SaveChangesAsync();
    }

    private static async Task SeedMediaFoldersAsync(AppDbContext context, SeedOptions seed)
    {
        if (seed.MediaFolders == null || seed.MediaFolders.Count == 0) return;

        var existingNames = await context.MediaFolders.Select(f => f.Name).ToListAsync();

        foreach (var folderName in seed.MediaFolders)
        {
            var path = $"storage/media/{folderName.ToLower()}";
            Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), path));

            if (!existingNames.Contains(folderName))
            {
                context.MediaFolders.Add(new MediaFolder { Name = folderName, Path = path });
            }
        }

        await context.SaveChangesAsync();
    }
}
