using Krtakan.Application.DTOs;

public interface IScoringService
{
    Task<ScoringResponse> CreateScoringAsync(CreateScoringRequest request);
}