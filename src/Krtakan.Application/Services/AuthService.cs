using AutoMapper;
using Krtakan.Application.Abstractions;
using Krtakan.Application.DTOs.Auth;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IRepository<School> _schools;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IMapper _mapper;

    public AuthService(
        IUserRepository users,
        IRoleRepository roles,
        IRepository<School> schools,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService tokenService,
        IRefreshTokenRepository refreshTokens,
        IMapper mapper)
    {
        _users = users;
        _roles = roles;
        _schools = schools;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokens = refreshTokens;
        _mapper = mapper;
    }

    public async Task<RegisterResultViewModel> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();
        var lastName = dto.LastName.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();
        if (name.Length == 0 || lastName.Length == 0)
            throw new AppException("Name and last name are required.");

        if (!IranMobile.TryNormalize(dto.PhoneNumber, out var phone))
            throw new AppException("Enter a valid Iranian mobile number, e.g. 09123456789.");

        if (dto.Password.Length is < 8 or > 72)
            throw new AppException("Password must be between 8 and 72 characters.");

        if (await _users.EmailExistsAsync(email, cancellationToken))
            throw new AppException("An account with this email already exists.", 409);

        if (await _users.PhoneExistsAsync(phone, cancellationToken))
            throw new AppException("An account with this phone already exists.", 409);

        var studentRole = await _roles.GetByNameAsync(RoleNames.Student, cancellationToken)
            ?? throw new AppException("The student role is not configured.", 500);

        var user = new User
        {
            Name = name,
            LastName = lastName,
            Email = email,
            PhoneNumber = phone,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            RegisterDate = DateTime.UtcNow,
            SchoolId = dto.SchoolId,
            Roles = new List<Role> { studentRole },
            IsApproved = false
        };

        await _users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegisterResultViewModel
        {
            Message = "Registration submitted. An administrator must approve your account before you can sign in.",
            User = _mapper.Map<UserViewModel>(user)
        };
    }

    public async Task<AuthResponseViewModel> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailWithDetailsAsync(email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new AppException("Email or password is incorrect.", 401);

        var fullName = $"{user.Name} {user.LastName}".Trim();
        var roleName = user.Roles.FirstOrDefault()?.Name ?? "User";
        var accessToken = _tokenService.CreateToken(user.Id, user.Email, roleName, fullName);

        var (refreshToken, expiresAt) = _tokenService.CreateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            ExpiresAt = expiresAt,
            UserId = user.Id
        };

        await _refreshTokens.AddAsync(refreshTokenEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponseViewModel
        {
            Token = accessToken.Token,
            ExpiresAt = accessToken.ExpiresAt,
            RefreshToken = refreshToken,
            RefreshTokenExpiresAt = expiresAt,
            User = _mapper.Map<UserViewModel>(user)
        };
    }

    public async Task<AuthResponseViewModel> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _refreshTokens.GetByTokenAsync(dto.Token, cancellationToken)
            ?? throw new AppException("Invalid refresh token.", 401);

        if (refreshToken.ExpiresAt < DateTime.UtcNow || refreshToken.IsRevoked)
            throw new AppException("Refresh token is expired or revoked.", 401);

        var user = await _users.GetByIdWithDetailsAsync(refreshToken.UserId, cancellationToken)
            ?? throw new AppException("User not found.", 401);

        var fullName = $"{user.Name} {user.LastName}".Trim();
        var roleName = user.Roles.FirstOrDefault()?.Name ?? "User";
        var accessToken = _tokenService.CreateToken(user.Id, user.Email, roleName, fullName);

        var (newRefreshToken, newExpiresAt) = _tokenService.CreateRefreshToken();

        // Invalidate the old refresh token by creating a new one
        refreshToken.IsRevoked = true;

        var newRefreshTokenEntity = new RefreshToken
        {
            Token = newRefreshToken,
            ExpiresAt = newExpiresAt,
            UserId = user.Id
        };

        await _refreshTokens.AddAsync(newRefreshTokenEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponseViewModel
        {
            Token = accessToken.Token,
            ExpiresAt = accessToken.ExpiresAt,
            RefreshToken = newRefreshToken,
            RefreshTokenExpiresAt = newExpiresAt,
            User = _mapper.Map<UserViewModel>(user)
        };
    }

    public async Task<UserViewModel> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 401);

        return _mapper.Map<UserViewModel>(user);
    }

    public async Task<bool> ChangePasswordAsync(int userId, string password)
    {
        if (password.Length is < 8 or > 72)
            throw new AppException("Password must be between 8 and 72 characters.");
        var user = await _users.GetByIdWithDetailsAsync(userId)
            ?? throw new AppException("User not found.", 401);

        user.PasswordHash = _passwordHasher.Hash(password);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
