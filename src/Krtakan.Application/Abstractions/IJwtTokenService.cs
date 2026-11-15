namespace Krtakan.Application.Abstractions;

public interface IJwtTokenService
{
    AccessToken CreateToken(int userId, string email, IEnumerable<string> roles, string fullName);
    (string Token, DateTime ExpiresAt) CreateRefreshToken();
}
