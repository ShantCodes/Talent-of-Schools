using AutoMapper;
using Krtakan.Application.Abstractions;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Common;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;


    public UserService(IUserRepository users, IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<UserViewModel>> ListPendingAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var users = await _users.ListPendingAsync(pageNumber, pageSize, cancellationToken);
        var items = _mapper.Map<IEnumerable<UserViewModel>>(users.Items);
        return new PagedResult<UserViewModel>(items, users.TotalCount, users.PageNumber, users.PageSize);
    }

    public async Task<PagedResult<UserViewModel>> ListUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var users = await _users.ListUsersAsync(pageNumber, pageSize, cancellationToken);
        var items = _mapper.Map<IEnumerable<UserViewModel>>(users.Items);
        return new PagedResult<UserViewModel>(items, users.TotalCount, users.PageNumber, users.PageSize);
    }

        public async Task<PagedResult<UserViewModel>> ListApprovedUsersAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var users = await _users.ListApprovedUsersAsync(pageNumber, pageSize, cancellationToken);
        var items = _mapper.Map<IEnumerable<UserViewModel>>(users.Items);
        return new PagedResult<UserViewModel>(items, users.TotalCount, users.PageNumber, users.PageSize);
    }

    public async Task<UserViewModel> ApproveAsync(int userId, bool isApproved, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        user.IsApproved = isApproved;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserViewModel>(user);
    }

    public async Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        _users.Remove(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
    public async Task<UserViewModel> UpdateUserRoleAsync(int userId, int roleId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        user.RoleId = roleId;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserViewModel>(user);
    }

    public async Task<bool> ChangePasswordAsync(string email, string newPassword, CancellationToken cancellationToken = default)
    {
        if (newPassword.Length is < 8 or > 72)
            throw new AppException("Password must be between 8 and 72 characters.");

        var user = await _users.GetByEmailWithDetailsAsync(email, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        user.PasswordHash = _passwordHasher.Hash(newPassword);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

}
