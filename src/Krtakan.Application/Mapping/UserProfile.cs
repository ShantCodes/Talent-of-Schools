using AutoMapper;
using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.Mapping;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserViewModel>()
            .ForMember(destination => destination.Role, options => options.MapFrom(source => source.Role.Name))
            .ForMember(destination => destination.SchoolName, options => options.MapFrom(source => source.School == null ? null : source.School.Name))
            .ForMember(destination => destination.FullName, options => options.MapFrom(source => (source.Name + " " + source.LastName).Trim()));
    }
}
