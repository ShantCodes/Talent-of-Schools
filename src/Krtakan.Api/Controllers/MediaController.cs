using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Krtakan.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController(IMediaService mediaService) : ControllerBase
{
    [HttpGet("download/{id:int}")]
    public async Task<IActionResult> Download(int id, CancellationToken cancellationToken)
    {
        var stream = await mediaService.GetFileStreamAsync(id, cancellationToken);

        // For now, we'll just return the stream.
        // In a real app, you'd want to set the Content-Type based on the extension.
        return File(stream, "application/octet-stream", $"media_{id}");
    }
}