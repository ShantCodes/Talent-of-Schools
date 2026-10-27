namespace Krtakan.Application.Options;

public class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    public string RootPath { get; set; } = Path.Combine("storage", "media");
}
