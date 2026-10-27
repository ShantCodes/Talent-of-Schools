namespace Krtakan.Application.Options;

public class SeedOptions
{
    public const string SectionName = "Seed";

    public string AdminEmail { get; set; } = string.Empty;

    public string AdminPassword { get; set; } = string.Empty;

    public string AdminName { get; set; } = "System";

    public string AdminLastName { get; set; } = "Administrator";
}
