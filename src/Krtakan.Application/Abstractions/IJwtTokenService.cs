namespace Krtakan.Application.Abstractions;

public interface IJwtTokenService
{
    AccessToken CreateToken(int userId, string email, string role, string fullName);
}
