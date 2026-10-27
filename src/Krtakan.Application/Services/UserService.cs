using AutoMapper;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.Auth;
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

    public async Task<IReadOnlyList<UserViewModel>> ListPendingAsync(CancellationToken cancellationToken = default)
    {
        var users = await _users.ListPendingAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<UserViewModel>>(users);
    }

    public async Task<UserViewModel> ApproveAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        if (!user.IsApproved)
        {
            user.IsApproved = true;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return _mapper.Map<UserViewModel>(user);
    }
}
