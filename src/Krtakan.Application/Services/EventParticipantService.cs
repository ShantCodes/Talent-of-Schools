using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.EventParticipant;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using AutoMapper;
using Krtakan.Domain.Common;
using System.Security.Claims;
using Krtakan.Api.ViewModels;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Krtakan.Application.Services;

public class EventParticipantService(
    IEventParticipantRepository eventParticipantRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IMediaService mediaService,
    IAuthService authService,
    IEventService eventService,
    IScoringRepository scoringRepository) : IEventParticipantService
{
    public async Task<EventParticipantViewModel> CreateEventParticipantAsync(CreateEventParticipantRequest request, int userId, CancellationToken cancellationToken = default)
    {
        var existingUser = await eventParticipantRepository.GetEventParticipantByUserIdAndEventIdAsync(request.UserId, request.EventId);
        var existingEvent = await eventService.GetEventAsync(request.EventId);
        var user = await authService.GetCurrentUserAsync(userId);        
        // if (user.BirthDate < existingEvent.MinBirthDate || user.BirthDate > existingEvent.MaxBirthDate)
        // {
        //     throw new InvalidOperationException("the user is not in the age range");
        // }
        // if (existingUser != null)
        // {
        //     throw new InvalidOperationException(
        //         $"User {request.UserId} is already a participant of event {request.EventId}.");
        // }
        int? documentId = request.DocumentId;

        if (request.FileStream != null && !string.IsNullOrEmpty(request.FileName))
        {
            var media = await mediaService.UploadMediaAsync(
                request.FileStream,
                request.FileName,
                2,
                1,
                cancellationToken
            );
            documentId = media.Id;
        }

        var participant = new EventParticipant
        {
            Title = request.Title,
            Author = request.Author,
            UserId = request.UserId,
            EventId = request.EventId,
            DocumentId = documentId
        };

        await eventParticipantRepository.AddAsync(participant, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<EventParticipantViewModel>(participant);
    }

    public async Task<PagedResult<EventParticipantViewModel>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventParticipantRepository.GetParticipantsByEventIdAsync(eventId, pageNumber, pageSize, cancellationToken);
        return mapper.Map<PagedResult<EventParticipantViewModel>>(pagedResult);
    }

    public async Task<PagedResult<EventParticipantViewModel>> GetParticipantsWithUserDetailsAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventParticipantRepository.GetParticipantsWithUserDetailsAsync(eventId, pageNumber, pageSize, cancellationToken);        
        return mapper.Map<PagedResult<EventParticipantViewModel>>(pagedResult);
    }

    public async Task<bool> DeleteEventParticipantAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await eventParticipantRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            return false;
        }

        eventParticipantRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateEventParticipantAsync(int id, UpdateEventParticipantRequest request, int currentUserId, CancellationToken cancellationToken = default)
    {
        var entity = await eventParticipantRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            return false;
        }

        // Ownership check
        if (entity.UserId != currentUserId)
        {
            throw new AppException("You can only edit your own data.", 403);
        }

        entity.Title = request.Title;
        entity.Author = request.Author;
        entity.DocumentId = request.DocumentId;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<ParticipantResultViewModel>> GetParticipantResultsAsync(
    int eventId,
    CancellationToken cancellationToken = default)
    {
        var scores = await scoringRepository.GetScoresByEventIdAsync(eventId);

        if (scores is null || !scores.Any())
        {
            return Array.Empty<ParticipantResultViewModel>();
        }

        var results = scores
            .GroupBy(s => s.EventParticipantId)
            .Select(g => new
            {
                EventParticipantId = g.Key,
                AverageScore = g.Average(s => s.Score)
            })
            .ToList();

        var participantIds = results.Select(r => r.EventParticipantId).ToList();

        var participants = await eventParticipantRepository
            .GetParticipantsWithUserDetailsByIdsAsync(participantIds, cancellationToken);

        var participantLookup = participants.ToDictionary(p => p.Id);

        return results
            .Where(r => participantLookup.ContainsKey(r.EventParticipantId))
            .Select(r =>
            {
                var participant = participantLookup[r.EventParticipantId];

                return new ParticipantResultViewModel
                {
                    Title = participant.Title,
                    Author = participant.Author,
                    UserName = participant.User.Name,
                    UserLastName = participant.User.LastName,
                    ProfilePictureId = participant.User.ProfilePictureMediaId,
                    AverageScore = Math.Round(r.AverageScore, 2)
                };
            })
            .OrderByDescending(r => r.AverageScore)   // optional: ranked by score
            .ToList();
    }
}
