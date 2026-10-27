using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Krtakan.Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            // Uses the same relative database name as the API's appsettings connection string.
            .UseSqlite("Data Source=krtakan.db")
            .Options;

        return new AppDbContext(options);
    }
}
