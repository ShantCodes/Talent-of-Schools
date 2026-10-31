using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Application.ViewModels.Event;

namespace Krtakan.Application.Services;

public interface IEventService
{
    Task<EventViewModel> CreateEventAsync(CreateEventRequest request, CancellationToken cancellationToken = default);
}
