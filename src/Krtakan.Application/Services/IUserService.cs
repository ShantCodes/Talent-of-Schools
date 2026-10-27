using Krtakan.Application.ViewModels.Auth;

namespace Krtakan.Application.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserViewModel>> ListPendingAsync(CancellationToken cancellationToken = default);

    Task<UserViewModel> ApproveAsync(int userId, CancellationToken cancellationToken = default);
}
