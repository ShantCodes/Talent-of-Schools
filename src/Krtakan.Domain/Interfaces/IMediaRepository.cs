using Krtakan.Domain.Entities;

namespace Krtakan.Domain.Interfaces;

public interface IMediaRepository : IRepository<Media>
{
    Task<Media?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
}