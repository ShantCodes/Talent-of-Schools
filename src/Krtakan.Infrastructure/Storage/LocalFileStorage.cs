using Krtakan.Application.Abstractions;
using Krtakan.Application.Options;
using Microsoft.Extensions.Options;

namespace Krtakan.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;
    public LocalFileStorage(string contentRoot, IOptions<FileStorageOptions> options) => _root = Path.GetFullPath(Path.Combine(contentRoot, options.Value.RootPath));
    public async Task<StoredFile> SaveAsync(Stream content, string originalFileName, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension)) throw new InvalidOperationException("A file extension is required.");
        var relativePath = Path.Combine(DateTime.UtcNow.ToString("yyyy/MM"), $"{Guid.NewGuid():N}{extension}").Replace('\\', '/');
        var physicalPath = GetPhysicalPath(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(physicalPath)!);
        await using var output = File.Create(physicalPath);
        await content.CopyToAsync(output, cancellationToken);
        return new StoredFile(relativePath, output.Length, extension.TrimStart('.'));
    }
    public Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default) { var path = GetPhysicalPath(relativePath); if (File.Exists(path)) File.Delete(path); return Task.CompletedTask; }
    public string GetPhysicalPath(string relativePath)
    {
        var path = Path.GetFullPath(Path.Combine(_root, relativePath));
        if (!path.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.Ordinal) && path != _root) throw new InvalidOperationException("Invalid storage path.");
        return path;
    }
}
