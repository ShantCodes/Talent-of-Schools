namespace Krtakan.Api.ViewModels;

public class EventsViewModels
{
    public class SignUpFormViewModel
    {
        public required string Title { get; set; }
        public required string Author { get; set; }
        public required int EventId { get; set; }
        public IFormFile? File { get; set; }
    }

    public class GetParticipantsDetailsRequest
    {
        public required int PageNumber { get; set; }
        public required int PageSize { get; set; }
        public List<int>? SchoolIds { get; set; }
    }
}
