using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class ScoringConfiguration : IEntityTypeConfiguration<Scoring>
{
    public void Configure(EntityTypeBuilder<Scoring> builder)
    {
        builder.ToTable("Scorings", table =>
            table.HasCheckConstraint("CK_Scorings_Score", "Score >= 0 AND Score <= 100"));

        builder.Property(scoring => scoring.Score).HasPrecision(5, 2).IsRequired();
        builder.HasIndex(scoring => new { scoring.PerformanceId, scoring.JurorId }).IsUnique();

        builder.HasOne(scoring => scoring.Performance)
            .WithMany(performance => performance.Scorings)
            .HasForeignKey(scoring => scoring.PerformanceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(scoring => scoring.Juror)
            .WithMany(user => user.GivenScores)
            .HasForeignKey(scoring => scoring.JurorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
