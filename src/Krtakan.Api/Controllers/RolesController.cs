using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = RoleNames.Admin)]
public class RolesController(IRoleService roleService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        return Ok(await roleService.ListRolesAsync(pageNumber, pageSize, cancellationToken));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoleDto roleDto, CancellationToken cancellationToken)
    {
        await roleService.AddRoleAsync(roleDto, cancellationToken);
        return Created();
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RoleDto roleDto, CancellationToken cancellationToken)
    {
        if (id != roleDto.Id)
        {
            return BadRequest("ID mismatch");
        }
        await roleService.UpdateRoleAsync(roleDto, cancellationToken);
        return Ok();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await roleService.DeleteRoleAsync(id, cancellationToken);
        return Ok();
    }
}
