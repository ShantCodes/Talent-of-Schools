using AutoMapper;
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

    public UserService(IUserRepository users, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _users = users;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
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
}
