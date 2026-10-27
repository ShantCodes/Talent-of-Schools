using Krtakan.Application.ViewModels.Auth;

namespace Krtakan.Application.Services;

public interface IUserService
{
    Task<PagedResult<UserViewModel>> ListPendingAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<PagedResult<UserViewModel>> ListUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);


    Task<UserViewModel> ApproveAsync(int userId, bool isApproved, CancellationToken cancellationToken = default);
}
