using AutoMapper;
using Krtakan.Domain.Entities;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Application.ViewModels.EventParticipant;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Mapping;

public class EventProfile : Profile
{
    public EventProfile()
    {
        CreateMap<Event, EventViewModel>();
        CreateMap<PagedResult<Event>, PagedResult<EventViewModel>>()
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
        CreateMap<PagedResult<EventParticipant>, PagedResult<EventParticipantViewModel>>()
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
        CreateMap<EventParticipant, EventParticipantViewModel>();
    }
}
