using Krtakan.Application.Services;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/events")]
[Authorize(Roles = RoleNames.Admin)]
public class EventsController(IEventService eventService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateEventRequest request) => Ok(await eventService.CreateEventAsync(request));
}

