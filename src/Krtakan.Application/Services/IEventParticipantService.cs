using Krtakan.Application.ViewModels.EventParticipant;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using AutoMapper;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Services;

public interface IEventParticipantService
{
    Task<EventParticipantViewModel> CreateEventParticipantAsync(CreateEventParticipantRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<EventParticipantViewModel>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<bool> DeleteEventParticipantAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> UpdateEventParticipantAsync(int id, UpdateEventParticipantRequest request, int currentUserId, CancellationToken cancellationToken = default);
    Task<PagedResult<EventParticipantViewModel>> GetParticipantsWithUserDetailsAsync(int eventId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);

}
