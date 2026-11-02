using AutoMapper;
using Krtakan.Application.DTOs;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels;
using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Krtakan.Application.Services;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RoleService(
        IRoleRepository roles,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _roles = roles;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<RoleDto>> ListRolesAsync(int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        var results = await _roles.ListAsync(
            predicate: null,
            pageNumber: pageNumber,
            pageSize: pageSize,
            cancellationToken: cancellationToken);

        var items = _mapper.Map<IEnumerable<RoleDto>>(results.Items);
        return new PagedResult<RoleDto>(items, results.TotalCount, results.PageNumber, results.PageSize);
    }

    public async Task<bool> AddRoleAsync(RoleDto roleDto, CancellationToken cancellationToken)
    {
        var role = new Role
        {
            Name = roleDto.Name
        };

        await _roles.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateRoleAsync(RoleDto roleDto, CancellationToken cancellationToken)
    {
        var role = await _roles.GetByIdAsync(roleDto.Id, cancellationToken)
            ?? throw new AppException("Role not found.", 404);

        role.Name = roleDto.Name;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteRoleAsync(int roleId, CancellationToken cancellationToken)
    {
        var role = await _roles.GetByIdAsync(roleId, cancellationToken)
            ?? throw new AppException("Role not found.", 404);

        _roles.Remove(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
