using Krtakan.Domain.Entities;

namespace Krtakan.Application.Services;

public interface IMediaService
{
    Task<Media?> GetMediaByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Media> UploadMediaAsync(Stream content, string fileName, int folderId, int formatId, CancellationToken cancellationToken = default);
    string GetDownloadUrl(Media media);
    Task<Stream> GetFileStreamAsync(int id, CancellationToken cancellationToken = default);
}