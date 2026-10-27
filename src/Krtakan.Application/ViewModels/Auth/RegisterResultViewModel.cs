namespace Krtakan.Application.ViewModels.Auth;

public class RegisterResultViewModel
{
    public string Message { get; set; } = string.Empty;

    public UserViewModel User { get; set; } = null!;
}
