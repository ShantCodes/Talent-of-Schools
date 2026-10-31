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
}

