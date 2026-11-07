using Krtakan.Application.DTOs;
using Krtakan.Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Krtakan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoringController : ControllerBase
{
    private readonly IScoringService _scoringService;

    public ScoringController(IScoringService scoringService)
    {
        _scoringService = scoringService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateScoring([FromBody] CreateScoringRequest request)
    {
        var result = await _scoringService.CreateScoringAsync(request);
        return Ok(result);
    }
}
