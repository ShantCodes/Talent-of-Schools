using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Persistence;

public class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<Media> Media => Set<Media>();

    public DbSet<MediaFormat> MediaFormats => Set<MediaFormat>();

    public DbSet<Performance> Performances => Set<Performance>();

    public DbSet<Round> Rounds => Set<Round>();

    public DbSet<Scoring> Scorings => Set<Scoring>();

    public DbSet<School> Schools => Set<School>();

    public DbSet<Event> Events => Set<Event>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
