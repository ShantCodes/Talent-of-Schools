using Krtakan.Application.Services;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = RoleNames.Admin)]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<IActionResult> ListPending(CancellationToken cancellationToken) => Ok(await userService.ListPendingAsync(cancellationToken));
    [HttpPatch("{userId:int}/approve")]
    public async Task<IActionResult> Approve(int userId, CancellationToken cancellationToken) => Ok(await userService.ApproveAsync(userId, cancellationToken));
}
