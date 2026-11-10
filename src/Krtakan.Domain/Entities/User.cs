using Krtakan.Domain.Common;

namespace Krtakan.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public DateOnly? BirthDate { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime RegisterDate { get; set; }

    public int? SchoolId { get; set; }

    public School? School { get; set; }

    public int? Grade { get; set; }

    public bool IsApproved { get; set; }

    public int? ProfilePictureMediaId { get; set; }

    public Media? ProfilePicture { get; set; }

    public string PhoneNumber { get; set; } = string.Empty;


    public ICollection<Performance> Performances { get; set; } = new List<Performance>();

    public ICollection<Scoring> GivenScores { get; set; } = new List<Scoring>();

    public ICollection<Role> Roles { get; set; } = new List<Role>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
