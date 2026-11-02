using AutoMapper;
using Krtakan.Application.DTOs;
using Krtakan.Application.Exceptions;
using Krtakan.Application.ViewModels;
using Krtakan.Domain.Common;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Krtakan.Application.Services;

public class SchoolService : ISchoolService
{
    private readonly ISchoolRepository _schools;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SchoolService(
        ISchoolRepository schools,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _schools = schools;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<SchoolDto>> ListSchoolsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        var results = await _schools.ListAsync(
            predicate: null,
            pageNumber: pageNumber,
            pageSize: pageSize,
            cancellationToken: cancellationToken);

        var items = _mapper.Map<IEnumerable<SchoolDto>>(results.Items);
        return new PagedResult<SchoolDto>(items, results.TotalCount, results.PageNumber, results.PageSize);
    }

    public async Task<bool> AddSchoolAsync(SchoolDto schoolDto, CancellationToken cancellationToken)
    {
        var school = new School
        {
            Name = schoolDto.Name
        };

        await _schools.AddAsync(school, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateSchoolAsync(SchoolDto schoolDto, CancellationToken cancellationToken)
    {
        var school = await _schools.GetByIdAsync(schoolDto.Id, cancellationToken)
            ?? throw new AppException("School not found.", 404);

        school.Name = schoolDto.Name;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteSchoolAsync(int id, CancellationToken cancellationToken)
    {
        var school = await _schools.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("School not found.", 404);

        _schools.Remove(school);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
