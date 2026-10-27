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
    private readonly IMapper _mapper;

    public AuthService(
        IUserRepository users,
        IRoleRepository roles,
        IRepository<School> schools,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService tokenService,
        IMapper mapper)
    {
        _users = users;
        _roles = roles;
        _schools = schools;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    public async Task<RegisterResultViewModel> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();
        var lastName = dto.LastName.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();

        if (name.Length == 0 || lastName.Length == 0)
            throw new AppException("Name and last name are required.");

        if (dto.BirthDate == default
            || dto.BirthDate > DateOnly.FromDateTime(DateTime.UtcNow)
            || dto.BirthDate.Year < DateTime.UtcNow.Year - 120)
            throw new AppException("Birth date is not valid.");

        if (dto.Grade is < 1 or > 12)
            throw new AppException("Grade must be between 1 and 12.");

        if (dto.Password.Length is < 8 or > 72)
            throw new AppException("Password must be between 8 and 72 characters.");

        if (await _users.EmailExistsAsync(email, cancellationToken))
            throw new AppException("An account with this email already exists.", 409);

        if (dto.SchoolId is int schoolId && !await _schools.AnyAsync(school => school.Id == schoolId, cancellationToken))
            throw new AppException("The selected school does not exist.");

        var studentRole = await _roles.GetByNameAsync(RoleNames.Student, cancellationToken)
            ?? throw new AppException("The student role is not configured.", 500);

        var user = new User
        {
            Name = name,
            LastName = lastName,
            BirthDate = dto.BirthDate,
            Email = email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            RegisterDate = DateTime.UtcNow,
            RoleId = studentRole.Id,
            Role = studentRole,
            SchoolId = dto.SchoolId,
            Grade = dto.Grade,
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

        if (!user.IsApproved)
            throw new AppException("Your account is waiting for administrator approval.", 403);

        var fullName = $"{user.Name} {user.LastName}".Trim();
        var accessToken = _tokenService.CreateToken(user.Id, user.Email, user.Role.Name, fullName);

        return new AuthResponseViewModel
        {
            Token = accessToken.Token,
            ExpiresAt = accessToken.ExpiresAt,
            User = _mapper.Map<UserViewModel>(user)
        };
    }

    public async Task<UserViewModel> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdWithDetailsAsync(userId, cancellationToken)
            ?? throw new AppException("User not found.", 401);

        return _mapper.Map<UserViewModel>(user);
    }
}
