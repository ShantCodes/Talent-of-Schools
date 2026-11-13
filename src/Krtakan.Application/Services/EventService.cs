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

    public async Task<PagedResult<EventViewModel>> GetEventsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var pagedResult = await eventRepository.ListAsync(null, pageNumber, pageSize, cancellationToken);

        return mapper.Map<PagedResult<EventViewModel>>(pagedResult);
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

