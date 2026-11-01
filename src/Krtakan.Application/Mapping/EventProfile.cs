using AutoMapper;
using Krtakan.Domain.Entities;
using Krtakan.Application.ViewModels.Event;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Mapping;

public class EventProfile : Profile
{
    public EventProfile()
    {
        CreateMap<Event, EventViewModel>();
        CreateMap<PagedResult<Event>, PagedResult<EventViewModel>>()
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
    }
}
