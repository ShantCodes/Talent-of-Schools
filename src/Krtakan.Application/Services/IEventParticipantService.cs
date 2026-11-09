using Krtakan.Application.ViewModels.EventParticipant;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Krtakan.Api.ViewModels;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Services;

public interface IEventParticipantService
{
    Task<EventParticipantViewModel> CreateEventParticipantAsync(CreateEventParticipantRequest request, System.Threading.CancellationToken cancellationToken = default);
    Task<PagedResult<EventParticipantViewModel>> GetParticipantsByEventIdAsync(int eventId, int pageNumber, int pageSize, System.Threading.CancellationToken cancellationToken = default);
    Task<PagedResult<EventParticipantViewModel>> GetParticipantsWithUserDetailsAsync(int eventId, int pageNumber, int pageSize, System.Threading.CancellationToken cancellationToken = default);
    Task<bool> DeleteEventParticipantAsync(int id, System.Threading.CancellationToken cancellationToken = default);
    Task<bool> UpdateEventParticipantAsync(int id, UpdateEventParticipantRequest request, int currentUserId, System.Threading.CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ParticipantResultViewModel>> GetParticipantResultsAsync(
    int eventId,
    CancellationToken cancellationToken = default);
}
