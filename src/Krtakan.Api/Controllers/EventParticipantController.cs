using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Krtakan.Application.ViewModels.EventParticipant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Krtakan.Api.ViewModels;
using System.Security.Claims;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventParticipantController(
    IEventParticipantService eventParticipantService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await eventParticipantService.GetEventParticipantsAsync(1, 100);
        return Ok(result);
    }

    [HttpPost("signup")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Create(EventsViewModels.SignUpFormViewModel request)
    {
        var createRequest = new CreateEventParticipantRequest(
            request.Title,
            request.Author,
            request.UserId,
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
}