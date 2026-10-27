using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class MediaConfiguration : IEntityTypeConfiguration<Media>
{
    public void Configure(EntityTypeBuilder<Media> builder)
    {
        builder.ToTable("Media");
        builder.Property(media => media.Path).HasMaxLength(500).IsRequired();
        builder.Property(media => media.Size).IsRequired();

        builder.HasOne(media => media.Format)
            .WithMany(format => format.MediaItems)
            .HasForeignKey(media => media.FormatId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
