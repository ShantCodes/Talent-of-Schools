using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class ScoringConfiguration : IEntityTypeConfiguration<Scoring>
{
    public void Configure(EntityTypeBuilder<Scoring> builder)
    {
        builder.ToTable("Scorings");
        builder.HasKey(scoring => new { scoring.EventParticipantId, scoring.JurorId });

        builder.Property(scoring => scoring.Score).HasPrecision(5, 2).IsRequired();
        builder.HasIndex(scoring => new { scoring.EventParticipantId, scoring.JurorId }).IsUnique();

        builder.HasOne(scoring => scoring.Performance)
            .WithMany(performance => performance.Scorings)
            .HasForeignKey(scoring => scoring.PerformanceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(scoring => scoring.Participant)
            .WithMany(participant => participant.Scorings)
            .HasForeignKey(scoring => scoring.EventParticipantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(scoring => scoring.Juror)
            .WithMany(user => user.GivenScores)
            .HasForeignKey(scoring => scoring.JurorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
