using Krtakan.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Krtakan.Application.DTOs;
using Krtakan.Domain.Entities;

namespace Krtakan.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection));
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<ISchoolService, SchoolService>();
        services.AddScoped<IEventParticipantService, EventParticipantService>();
        services.AddScoped<IScoringService, ScoringService>();
        return services;
    }
}
