using Krtakan.Application.DTOs;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Krtakan.Application.Services;

public class ScoringService : IScoringService
{
    private readonly IScoringRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ScoringService(IScoringRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScoringResponse> CreateScoringAsync(CreateScoringRequest request)
    {
        if (!request.IsValid)
        {
            throw new ArgumentException("Score must be between 1 and 5.");
        }

        var scoring = new Scoring
        {
            EventParticipantId = request.EventParticipantId,
            JurorId = request.JurorId,
            Score = request.Score,
            PerformanceId = request.PerformanceId
        };

        await _repository.AddAsync(scoring);
        await _unitOfWork.SaveChangesAsync();


        return new ScoringResponse(
            scoring.Id,
            scoring.EventParticipantId,
            scoring.JurorId,
            scoring.Score,
            request.PerformanceId.HasValue ? request.PerformanceId.Value : null
        );
    }
}
