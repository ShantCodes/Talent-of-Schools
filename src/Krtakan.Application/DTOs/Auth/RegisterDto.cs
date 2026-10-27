using System.ComponentModel.DataAnnotations;

namespace Krtakan.Application.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public DateOnly BirthDate { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(72)]
    public string Password { get; set; } = string.Empty;

    public int? SchoolId { get; set; }

    [Range(1, 12)]
    public int? Grade { get; set; }
}
