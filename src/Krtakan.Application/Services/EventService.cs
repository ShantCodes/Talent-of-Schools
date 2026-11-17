using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using AutoMapper;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Services;

public class EventService(IEventRepository eventRepository, IUnitOfWork unitOfWork, IMapper mapper) : IEventService
{
    public async Task<EventViewModel> CreateEventAsync(CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        var eventEntity = new Event
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MinBirthDate = request.MinBirthDate,
            MaxBirthDate = request.MaxBirthDate
        };

        await eventRepository.AddAsync(eventEntity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<EventViewModel>(eventEntity);
    }

    public async Task<PagedResult<EventViewModel>> GetEventsAsync(
    int userId,
    int pageNumber,
    int pageSize,
    CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventRepository.ListAsync(
            null, pageNumber, pageSize, cancellationToken);

        var eventIds = pagedResult.Items.Select(e => e.Id).ToList();

        var participants = await eventRepository.GetParticipantsWithScoresAsync(
            eventIds, cancellationToken);

        var result = pagedResult.Items.Select(e =>
        {
            var userParticipant = participants
                .FirstOrDefault(p => p.EventId == e.Id && p.UserId == userId);

            if (userParticipant == null)
            {
                return new EventViewModel(
                    e.Id,
                    e.Name,
                    e.Description,
                    e.StartDate,
                    e.EndDate,
                    e.MinBirthDate,
                    e.MaxBirthDate,
                    null,
                    null,
                    null,
                    null
                );
            }

            var averageScore = userParticipant.Scorings.Any()
                ? userParticipant.Scorings.Average(s => s.Score)
                : (decimal?)null;

            int? rank = null;

            if (averageScore.HasValue)
            {
                var participantAverages = participants
                    .Where(p => p.EventId == e.Id && p.Scorings.Any())
                    .Select(p => new
                    {
                        p.Id,
                        Average = p.Scorings.Average(s => s.Score)
                    })
                    .ToList();

                rank = participantAverages.Count(p =>
                    p.Average > averageScore.Value) + 1;
            }

            return new EventViewModel(
                e.Id,
                e.Name,
                e.Description,
                e.StartDate,
                e.EndDate,
                e.MinBirthDate,
                e.MaxBirthDate,
                userParticipant.Title,
                userParticipant.Author,
                averageScore,
                rank
            );
        }).ToList();

        return new PagedResult<EventViewModel>(
            result,
            pagedResult.TotalCount,
            pageNumber,
            pageSize
        );
    }
    public async Task<EventViewModel> GetEventAsync(int eventId, CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventRepository.GetByIdAsync(eventId);
        return mapper.Map<EventViewModel>(pagedResult);
    }

    public async Task<bool> DeleteEventAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await eventRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            return false;
        }

        entity.IsDeleted = true;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
    public async Task<bool> EditEventAsync(int id, CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await eventRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            return false;
        }
        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.MinBirthDate = request.MinBirthDate;
        entity.MaxBirthDate = request.MaxBirthDate;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

