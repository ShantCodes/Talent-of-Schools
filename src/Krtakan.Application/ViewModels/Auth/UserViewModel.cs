namespace Krtakan.Application.ViewModels.Auth;

public class UserViewModel
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateOnly BirthDate { get; set; }

    public string Role { get; set; } = string.Empty;

    public int? SchoolId { get; set; }

    public string? SchoolName { get; set; }

    public int? Grade { get; set; }

    public bool IsApproved { get; set; }

    public DateTime RegisterDate { get; set; }

    public int? ProfilePictureMediaId { get; set; }
}
