using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.EventParticipant;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using AutoMapper;
using Krtakan.Domain.Common;
using System.Security.Claims;

namespace Krtakan.Application.Services;

public class EventParticipantService(
    IEventParticipantRepository eventParticipantRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IMediaService mediaService) : IEventParticipantService
{
    public async Task<EventParticipantViewModel> CreateEventParticipantAsync(CreateEventParticipantRequest request, CancellationToken cancellationToken = default)
    {
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
    // ... rest of the methods

    public async Task<PagedResult<EventParticipantViewModel>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventParticipantRepository.GetParticipantsByEventIdAsync(eventId, pageNumber, pageSize, cancellationToken);
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
}
