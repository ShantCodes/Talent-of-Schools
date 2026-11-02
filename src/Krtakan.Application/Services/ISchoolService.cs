using Krtakan.Application.DTOs;
using Krtakan.Domain.Interfaces;
using Krtakan.Domain.Entities;
using Krtakan.Domain.Common;

namespace Krtakan.Application.Services;

public interface ISchoolService
{
    Task<PagedResult<SchoolDto>> ListSchoolsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<bool> AddSchoolAsync(SchoolDto schoolDto, CancellationToken cancellationToken);
    Task<bool> UpdateSchoolAsync(SchoolDto schoolDto, CancellationToken cancellationToken);
    Task<bool> DeleteSchoolAsync(int id, CancellationToken cancellationToken);
}
