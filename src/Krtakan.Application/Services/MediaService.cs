using Krtakan.Application.Abstractions;
using Krtakan.Application.Exceptions;
using Krtakan.Application.Options;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.Extensions.Options;
using System.IO;

namespace Krtakan.Application.Services;

public class MediaService(IMediaRepository mediaRepository, IFileStorage fileStorage, IOptions<FileStorageOptions> storageOptions) : IMediaService
{
    public async Task<Media?> GetMediaByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await mediaRepository.GetByIdWithDetailsAsync(id, cancellationToken);
    }

    public string GetDownloadUrl(Media media)
    {
        return $"/api/media/download/{media.Id}";
    }

    public async Task<Stream> GetFileStreamAsync(int id, CancellationToken cancellationToken = default)
    {
        var media = await GetMediaByIdAsync(id, cancellationToken);
        if (media == null) throw new AppException("Media not found.", 404);

        var folder = media.Folder;
        if (string.IsNullOrEmpty(folder?.Path)) throw new AppException("Media folder path is not configured.", 500);

        // The path in the DB is absolute-ish starting from /media/
        // We need to resolve it relative to the app root + storage root.
        // Since IFileStorage.GetPhysicalPath uses _root (which is contentRoot/RootPath)
        // we can leverage that if we adjust the path.

        // Example: Folder Path = "/media/images"
        // RootPath = "storage/media"
        // We want to reach "storage/media/images"

        var relativePath = folder.Path.Replace("/media", "");
        // If Path was "/media/images", relativePath becomes "/images"

        var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "media", relativePath.TrimStart('/'));

        if (!File.Exists(physicalPath))
        {
            throw new AppException($"File not found at {physicalPath}", 404);
        }

        return File.OpenRead(physicalPath);
    }
}