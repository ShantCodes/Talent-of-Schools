using Krtakan.Application.DTOs.Auth;
using Krtakan.Application.ViewModels.Auth;

namespace Krtakan.Application.Services;

public interface IAuthService
{
    Task<RegisterResultViewModel> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseViewModel> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseViewModel> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default);

    Task<UserViewModel> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(int userId, string password);
}
