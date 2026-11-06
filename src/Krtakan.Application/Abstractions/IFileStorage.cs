namespace Krtakan.Application.Abstractions;

public interface IFileStorage
{
    Task<StoredFile> SaveAsync(Stream content, string originalFileName, string directory, CancellationToken cancellationToken = default);

    Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default);

    string GetPhysicalPath(string relativePath);
}
