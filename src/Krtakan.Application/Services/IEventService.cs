using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Services;

public interface IEventService
{
    Task<EventViewModel> CreateEventAsync(CreateEventRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<EventViewModel>> GetEventsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}
