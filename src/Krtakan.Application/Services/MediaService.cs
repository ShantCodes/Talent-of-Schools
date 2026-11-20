
using Krtakan.Application.Abstractions;
using Krtakan.Application.Exceptions;
using Krtakan.Application.Options;
using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.Extensions.Options;
using System.IO;
using SkiaSharp;

namespace Krtakan.Application.Services;

public class MediaService(
    IMediaRepository mediaRepository,
    IFileStorage fileStorage,
    IUnitOfWork unitOfWork,
    IOptions<FileStorageOptions> storageOptions,
    IMediaFolderRepository folderRepository) : IMediaService
{
    public async Task<Media?> GetMediaByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await mediaRepository.GetByIdWithDetailsAsync(id, cancellationToken);
    }

    public async Task<Media> UploadMediaAsync(
        Stream content,
        string fileName,
        int folderId,
        int formatId,
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(extension))
            throw new InvalidOperationException("A file extension is required.");

        var folder = await folderRepository.GetByIdAsync(folderId, cancellationToken);

        if (folder == null)
            throw new AppException("Media folder not found.", 404);

        var directory = !string.IsNullOrEmpty(folder.Path)
            ? folder.Path
            : folder.Name;

        Stream uploadContent = content;
        var uploadFileName = fileName;

        MemoryStream? compressedStream = null;

        try
        {
            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            if (imageExtensions.Contains(extension))
            {
                compressedStream = await CompressImageAsync(
                    content,
                    cancellationToken
                );

                uploadContent = compressedStream;
                uploadFileName = Path.ChangeExtension(fileName, ".webp");
            }

            var storedFile = await fileStorage.SaveAsync(
                uploadContent,
                uploadFileName,
                directory,
                cancellationToken
            );

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
        finally
        {
            compressedStream?.Dispose();
        }
    }

    public string GetDownloadUrl(Media media)
    {
        return $"{MediaUrlConstants.DownloadUrl}{media.Id}";
    }

    public async Task<Stream> GetFileStreamAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var media = await GetMediaByIdAsync(id, cancellationToken);

        if (media == null)
            throw new AppException("Media not found.", 404);

        var relativePath = media.RelativePath.TrimStart('/');
        var physicalPath = fileStorage.GetPhysicalPath(relativePath);

        if (!File.Exists(physicalPath))
            throw new AppException($"File not found at {physicalPath}", 404);

        return File.OpenRead(physicalPath);
    }

    private async Task<MemoryStream> CompressImageAsync(
        Stream content,
        CancellationToken cancellationToken = default)
    {
        if (content.CanSeek)
            content.Position = 0;

        using var original = SKBitmap.Decode(content);

        if (original == null)
            throw new InvalidOperationException("Unable to decode image.");

        SKBitmap image = original;

        if (original.Width > 1920 || original.Height > 1920)
        {
            var scale = Math.Min(
                1920f / original.Width,
                1920f / original.Height
            );

            var width = (int)(original.Width * scale);
            var height = (int)(original.Height * scale);

            image = original.Resize(
    new SKImageInfo(width, height),
    SKFilterQuality.Medium
) ?? throw new InvalidOperationException("Unable to resize image.");
        }

        try
        {
            using var skImage = SKImage.FromBitmap(image);
            using var encoded = skImage.Encode(SKEncodedImageFormat.Webp, 80);

            if (encoded == null)
                throw new InvalidOperationException("Unable to encode image as WebP.");

            var output = new MemoryStream();
            encoded.SaveTo(output);
            output.Position = 0;

            return output;
        }
        finally
        {
            if (image != original)
                image.Dispose();
        }
    }
}
