using AutoMapper;
using Krtakan.Application.DTOs;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.Mapping;

public class SchoolProfile : Profile
{
    public SchoolProfile()
    {
        CreateMap<School, SchoolDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));

        CreateMap<SchoolDto, School>();
    }
}
