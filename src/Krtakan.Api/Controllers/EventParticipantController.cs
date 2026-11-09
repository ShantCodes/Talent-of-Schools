using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Krtakan.Application.ViewModels.EventParticipant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Krtakan.Api.ViewModels;
using System.Security.Claims;
using Krtakan.Domain.Constants;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventParticipantController(
    IEventParticipantService eventParticipantService) : ControllerBase
{
    [HttpGet("event/{eventId}")]
    [Authorize(Roles = RoleNames.Juror + "," + RoleNames.Admin)]
    public async Task<IActionResult> GetParticipantsByEvent(int eventId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await eventParticipantService.GetParticipantsByEventIdAsync(eventId, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("event/{eventId}/details")]
    [Authorize(Roles = RoleNames.Juror + "," + RoleNames.Admin)]
    public async Task<IActionResult> GetParticipantsWithUserDetails(int eventId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await eventParticipantService.GetParticipantsWithUserDetailsAsync(eventId, pageNumber, pageSize);
        return Ok(result);
    }


    [HttpPost("signup")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Create(EventsViewModels.SignUpFormViewModel request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var createRequest = new CreateEventParticipantRequest(
            request.Title,
            request.Author,
            userId,
            request.EventId,
            null,
            request.File != null ? request.File.OpenReadStream() : null,
            request.File?.FileName
        );

        var result = await eventParticipantService.CreateEventParticipantAsync(createRequest);
        return Created($"api/{request.Title}", result);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateEventParticipantRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await eventParticipantService.UpdateEventParticipantAsync(id, request, userId);
        if (!result)
        {
            return NotFound();
        }
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await eventParticipantService.DeleteEventParticipantAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return Ok();
    }

    [HttpGet("/results/{eventId}")]
    [Authorize(Roles = RoleNames.Juror + "," + RoleNames.Admin)]
    public async Task<IActionResult> GetResults(int eventId)
    {
        var result = await eventParticipantService.GetParticipantResultsAsync(eventId);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }
}