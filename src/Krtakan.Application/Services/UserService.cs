using AutoMapper;
using Krtakan.Application.Abstractions;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Common;
using Krtakan.Domain.Interfaces;
using Krtakan.Application.DTOs;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMediaService _mediaService;

    public UserService(IUserRepository users, IRoleRepository roles, IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher, IMediaService mediaService)
    {
        _users = users;
        _roles = roles;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _mediaService = mediaService;
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

    public async Task<UserViewModel> UpdateUserRolesAsync(int userId, List<int> roleIds, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        user.Roles.Clear();
        foreach (var roleId in roleIds)
        {
            var role = await _roles.GetByIdAsync(roleId, cancellationToken);
            if (role != null)
            {
                user.Roles.Add(role);
            }
        }
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

    public async Task<UserViewModel> UpdateUserAsync(int userId, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 404);

        user.Name = dto.Name;
        user.LastName = dto.LastName;
        user.BirthDate = dto.BirthDate;
        user.Email = dto.Email;
        user.SchoolId = dto.SchoolId;
        user.Grade = dto.Grade;        
        user.PhoneNumber = dto.PhoneNumber;

        if (dto.RoleIds != null)
        {
            user.Roles.Clear();
            foreach (var roleId in dto.RoleIds)
            {
                var role = await _roles.GetByIdAsync(roleId, cancellationToken);
                if (role != null)
                {
                    user.Roles.Add(role);
                }
            }
        }

        if (dto.ProfilePictureStream is not null && !string.IsNullOrWhiteSpace(dto.ProfilePictureFileName))
        {
            var extension = Path.GetExtension(dto.ProfilePictureFileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            if (!allowedExtensions.Contains(extension))
            {
                throw new AppException("Invalid file format. Please upload a JPG, JPEG, PNG, or GIF image.");
            }

            var newMedia = await _mediaService.UploadMediaAsync(
                dto.ProfilePictureStream,
                dto.ProfilePictureFileName,
                folderId: 1,
                formatId: 1,
                cancellationToken);

            user.ProfilePictureMediaId = newMedia.Id;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserViewModel>(user);
    }
}