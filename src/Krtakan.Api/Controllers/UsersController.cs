using Krtakan.Application.ViewModels.Auth;
using Krtakan.Application.Services;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Krtakan.Application.DTOs;
using Krtakan.Api.ViewModels;

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

    [HttpGet("GetAllUsers")]
    public async Task<IActionResult> ListUsers(
        CancellationToken cancellationToken,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10) => Ok(await userService.ListUsersAsync(pageNumber, pageSize, cancellationToken));
    [HttpGet("GetApprovedUsers")]
    public async Task<IActionResult> ListApprovedUsers(
        CancellationToken cancellationToken,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10) => Ok(await userService.ListApprovedUsersAsync(pageNumber, pageSize, cancellationToken));

    [HttpPatch("{userId:int}/approve")]
    public async Task<IActionResult> Approve(int userId, bool isApproved, CancellationToken cancellationToken) => Ok(await userService.ApproveAsync(userId, isApproved, cancellationToken));
    [HttpDelete("{userId:int}")]
    public async Task<IActionResult> Delete(int userId, CancellationToken cancellationToken) => Ok(await userService.DeleteUserAsync(userId, cancellationToken));
    [HttpPatch("{userId:int}/role")]
    public async Task<IActionResult> UpdateRole(int userId, List<int> roleIds, CancellationToken cancellationToken) => Ok(await userService.UpdateUserRolesAsync(userId, roleIds, cancellationToken));

    [HttpPatch("/api/adminchangepassword")]
    [AllowAnonymous]
    public async Task<IActionResult> AdminChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken) =>
    Ok(await userService.ChangePasswordAsync(request.Username, request.Password, cancellationToken));    

    [HttpPost("updateProfile")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateProfile(
        [FromForm] UpdateUserViewModel request,
        CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);

        var dto = new UpdateUserDto
        {
            Name = request.Name,
            LastName = request.LastName,
            BirthDate = request.BirthDate,
            SchoolId = request.SchoolId,
            Grade = request.Grade,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email
        };

        if (request.ProfilePicture is not null)
        {
            dto.ProfilePictureStream = request.ProfilePicture.OpenReadStream();
            dto.ProfilePictureFileName = request.ProfilePicture.FileName;
        }

        var result = await userService.UpdateUserAsync(userId, dto, cancellationToken);
        return Ok(result);
    }
}
