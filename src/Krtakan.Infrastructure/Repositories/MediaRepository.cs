using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Krtakan.Infrastructure.Repositories;

public class MediaRepository(AppDbContext context) : EfRepository<Media>(context), IMediaRepository
{
    private IQueryable<Media> Details => Set.Include(media => media.Folder).Include(media => media.Format);

    public Task<Media?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default) =>
        Details.FirstOrDefaultAsync(media => media.Id == id, cancellationToken);
}