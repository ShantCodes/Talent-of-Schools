namespace Krtakan.Application.Abstractions;

public sealed record StoredFile(string RelativePath, long SizeBytes, string Extension);
