using Krtakan.Application.DTOs;
using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;

namespace Krtakan.Application.Services;

public interface IRoleService
{
    Task<PagedResult<RoleDto>> ListRolesAsync(int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<bool> AddRoleAsync(RoleDto roleDto, CancellationToken cancellationToken);
    Task<bool> UpdateRoleAsync(RoleDto roleDto, CancellationToken cancellationToken);
    Task<bool> DeleteRoleAsync(int roleId, CancellationToken cancellationToken);
}
