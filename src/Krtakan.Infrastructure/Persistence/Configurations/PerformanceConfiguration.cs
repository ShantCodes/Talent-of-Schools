using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class PerformanceConfiguration : IEntityTypeConfiguration<Performance>
{
    public void Configure(EntityTypeBuilder<Performance> builder)
    {
        builder.ToTable("Performances");
        builder.Property(performance => performance.UploadDate).IsRequired();

        builder.HasOne(performance => performance.User)
            .WithMany(user => user.Performances)
            .HasForeignKey(performance => performance.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(performance => performance.Round)
            .WithMany(round => round.Performances)
            .HasForeignKey(performance => performance.RoundId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(performance => performance.Media)
            .WithMany(media => media.Performances)
            .HasForeignKey(performance => performance.MediaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
