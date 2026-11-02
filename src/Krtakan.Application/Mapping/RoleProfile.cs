using AutoMapper;
using Krtakan.Application.DTOs;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.Mapping;

public class RoleProfile : Profile
{
    public RoleProfile()
    {
        CreateMap<Role, RoleDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));

        CreateMap<RoleDto, Role>();
    }
}
