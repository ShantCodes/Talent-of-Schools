using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class MediaFolderConfiguration : IEntityTypeConfiguration<MediaFolder>
{
    public void Configure(EntityTypeBuilder<MediaFolder> builder)
    {
        builder.ToTable("MediaFolders");
        builder.Property(f => f.Name).HasMaxLength(100).IsRequired();
        builder.Property(f => f.Path).HasMaxLength(500);

        builder.HasMany(f => f.MediaItems)
            .WithOne(m => m.Folder)
            .HasForeignKey(m => m.FolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
