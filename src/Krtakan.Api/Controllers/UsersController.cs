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
    public async Task<IActionResult> ListPending(
        CancellationToken cancellationToken,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10) => Ok(await userService.ListPendingAsync(pageNumber, pageSize, cancellationToken));


    [HttpGet]
    public async Task<IActionResult> ListUsers(
        CancellationToken cancellationToken,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10) => Ok(await userService.ListUsersAsync(pageNumber, pageSize, cancellationToken));

    [HttpPatch("{userId:int}/approve")]
    public async Task<IActionResult> Approve(int userId, bool isApproved, CancellationToken cancellationToken) => Ok(await userService.ApproveAsync(userId, isApproved, cancellationToken));
    [HttpDelete("{userId:int}")]
    public async Task<IActionResult> Delete(int userId, CancellationToken cancellationToken) => Ok(await userService.DeleteUserAsync(userId, cancellationToken));
}
