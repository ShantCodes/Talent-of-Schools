namespace Krtakan.Api.ViewModels;

public class UpdateUserViewModel
{
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public int? SchoolId { get; set; }
    public int? Grade { get; set; }
    public IFormFile? ProfilePicture {get; set;}
}

public class ChangPasswordViewModel
{
    public required string Password {get; set;}
}