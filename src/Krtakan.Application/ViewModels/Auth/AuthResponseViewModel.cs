namespace Krtakan.Application.ViewModels.Auth;

public class AuthResponseViewModel
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpiresAt { get; set; }
    public UserViewModel User { get; set; } = null!;
}
