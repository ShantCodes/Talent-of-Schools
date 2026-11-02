using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/schools")]
[Authorize(Roles = RoleNames.Admin)]
public class SchoolsController(ISchoolService schoolService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        return Ok(await schoolService.ListSchoolsAsync(pageNumber, pageSize, cancellationToken));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SchoolDto schoolDto, CancellationToken cancellationToken)
    {
        await schoolService.AddSchoolAsync(schoolDto, cancellationToken);
        return Created();
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SchoolDto schoolDto, CancellationToken cancellationToken)
    {
        if (id != schoolDto.Id)
        {
            return BadRequest("ID mismatch");
        }
        await schoolService.UpdateSchoolAsync(schoolDto, cancellationToken);
        return Ok();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await schoolService.DeleteSchoolAsync(id, cancellationToken);
        return Ok();
    }
}
