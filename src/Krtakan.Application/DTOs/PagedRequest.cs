namespace Krtakan.Application.DTOs;

public record PagedRequest(int PageNumber = 1, int PageSize = 10);
