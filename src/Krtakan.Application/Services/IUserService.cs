using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Common;
using Krtakan.Application.DTOs;

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
    Task<PagedResult<UserViewModel>> ListApprovedUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);


    Task<UserViewModel> ApproveAsync(int userId, bool isApproved, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserViewModel> UpdateUserRoleAsync(int userId, int roleId, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(string email, string newPassword, CancellationToken cancellationToken = default);
    Task<UserViewModel> UpdateUserAsync(int userId, UpdateUserDto dto, CancellationToken cancellationToken = default);


}
