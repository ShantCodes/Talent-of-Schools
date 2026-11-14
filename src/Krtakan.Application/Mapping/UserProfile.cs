using AutoMapper;
using Krtakan.Application.ViewModels.Auth;
using Krtakan.Domain.Constants;
using Krtakan.Domain.Entities;

namespace Krtakan.Application.Mapping;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserViewModel>()            
            .ForMember(destination => destination.Roles, options => options.MapFrom(source => source.Roles.Select(r => r.Name).ToList()))
            .ForMember(destination => destination.SchoolName, options => options.MapFrom(source => source.School == null ? null : source.School.Name))
            .ForMember(destination => destination.FullName, options => options.MapFrom(source => (source.Name + " " + source.LastName).Trim()))
            .ForMember(destination => destination.ProfilePictureUrl, options => options.MapFrom(source => source.ProfilePicture != null ? $"{MediaUrlConstants.DownloadUrl}{source.ProfilePicture.Id}" : null));            
        
    }
}
