namespace Krtakan.Application.Abstractions;

public sealed record AccessToken(string Token, DateTime ExpiresAt);
