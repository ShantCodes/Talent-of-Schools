using Krtakan.Application.Services;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Krtakan.Domain.Common;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService eventService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Create(
        [FromBody] CreateEventRequest request) => Ok(await eventService.CreateEventAsync(request));

    [HttpGet]
    [Authorize(Roles = RoleNames.Student + "," + RoleNames.Admin)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await eventService.GetEventsAsync(pageNumber, pageSize));
    }
}

