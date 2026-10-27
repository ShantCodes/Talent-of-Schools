using Krtakan.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Krtakan.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.Property(user => user.Name).HasMaxLength(100).IsRequired();
        builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.PasswordHash).HasColumnName("Password").HasMaxLength(200).IsRequired();
        builder.Property(user => user.RegisterDate).IsRequired();
        builder.Property(user => user.IsApproved).IsRequired();

        builder.HasOne(user => user.Role)
            .WithMany(role => role.Users)
            .HasForeignKey(user => user.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(user => user.School)
            .WithMany(school => school.Users)
            .HasForeignKey(user => user.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(user => user.ProfilePicture)
            .WithMany()
            .HasForeignKey(user => user.ProfilePictureMediaId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
