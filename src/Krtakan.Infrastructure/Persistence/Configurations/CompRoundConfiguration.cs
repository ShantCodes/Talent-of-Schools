using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class CompRoundConfiguration : IEntityTypeConfiguration<CompRound>
{
    public void Configure(EntityTypeBuilder<CompRound> builder)
    {
        builder.ToTable("CompRounds", table =>
            table.HasCheckConstraint("CK_CompRounds_DateRange", "EndDate >= StartDate"));

        builder.Property(round => round.Name).HasMaxLength(150).IsRequired();
        builder.Property(round => round.StartDate).IsRequired();
        builder.Property(round => round.EndDate).IsRequired();
    }
}
