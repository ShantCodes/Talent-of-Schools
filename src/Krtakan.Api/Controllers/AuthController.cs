using System.Security.Claims;
using Krtakan.Application.DTOs.Auth;
using Krtakan.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegisterDto dto, CancellationToken cancellationToken) => Created(string.Empty, await authService.RegisterAsync(dto, cancellationToken));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto, CancellationToken cancellationToken) => Ok(await authService.LoginAsync(dto, cancellationToken));

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await authService.GetCurrentUserAsync(userId, cancellationToken));
    }
}
