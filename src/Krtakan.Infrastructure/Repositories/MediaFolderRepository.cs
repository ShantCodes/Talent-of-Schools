using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Infrastructure.Persistence;

namespace Krtakan.Infrastructure.Repositories;

public class MediaFolderRepository(AppDbContext context) : EfRepository<MediaFolder>(context), IMediaFolderRepository
{
}