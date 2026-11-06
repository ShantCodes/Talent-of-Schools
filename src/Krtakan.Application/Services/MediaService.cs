using Krtakan.Application.Abstractions;
using Krtakan.Application.Exceptions;
using Krtakan.Application.Options;
using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.Extensions.Options;
using System.IO;

namespace Krtakan.Application.Services;

public class MediaService(IMediaRepository mediaRepository, IFileStorage fileStorage, IUnitOfWork unitOfWork, IOptions<FileStorageOptions> storageOptions, IMediaFolderRepository folderRepository) : IMediaService
{
    public async Task<Media?> GetMediaByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await mediaRepository.GetByIdWithDetailsAsync(id, cancellationToken);
    }

    public async Task<Media> UploadMediaAsync(Stream content, string fileName, int folderId, int formatId, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension)) throw new InvalidOperationException("A file extension is required.");

        var folder = await folderRepository.GetByIdAsync(folderId, cancellationToken);
        if (folder == null) throw new AppException("Media folder not found.", 404);

        var directory = !string.IsNullOrEmpty(folder.Path) ? folder.Path : folder.Name;

        var storedFile = await fileStorage.SaveAsync(content, fileName, directory, cancellationToken);

        var media = new Media
        {
            RelativePath = storedFile.RelativePath,
            Size = storedFile.SizeBytes,
            FormatId = formatId,
            FolderId = folderId
        };

        await mediaRepository.AddAsync(media, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return media;
    }

    public string GetDownloadUrl(Media media)
    {
        return $"{MediaUrlConstants.DownloadUrl}{media.Id}";
    }

    public async Task<Stream> GetFileStreamAsync(int id, CancellationToken cancellationToken = default)
    {
        var media = await GetMediaByIdAsync(id, cancellationToken);
        if (media == null) throw new AppException("Media not found.", 404);

        var relativePath = media.RelativePath.TrimStart('/');
        var physicalPath = fileStorage.GetPhysicalPath(relativePath);

        if (!File.Exists(physicalPath))
        {
            throw new AppException($"File not found at {physicalPath}", 404);
        }

        return File.OpenRead(physicalPath);
    }
}