using System.Text.Json.Serialization;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.DTOs;

public class UpdateUserDto
{
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public string Email { get; set; } = string.Empty;
    public int? SchoolId { get; set; }
    public int? Grade { get; set; }    
    public string PhoneNumber { get; set; } = string.Empty;
    public Stream? ProfilePictureStream { get; set; }
    public string? ProfilePictureFileName { get; set; }
    public List<int>? RoleIds { get; set; }
}