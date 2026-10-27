using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class MediaFormatConfiguration : IEntityTypeConfiguration<MediaFormat>
{
    public void Configure(EntityTypeBuilder<MediaFormat> builder)
    {
        builder.ToTable("MediaFormats");
        builder.Property(format => format.Name).HasMaxLength(10).IsRequired();
        builder.HasIndex(format => format.Name).IsUnique();
        builder.HasData(
            new MediaFormat { Id = 1, Name = MediaFormatNames.Mp3 },
            new MediaFormat { Id = 2, Name = MediaFormatNames.Mp4 },
            new MediaFormat { Id = 3, Name = MediaFormatNames.Jpg },
            new MediaFormat { Id = 4, Name = MediaFormatNames.Jpeg },
            new MediaFormat { Id = 5, Name = MediaFormatNames.Png });
    }
}
