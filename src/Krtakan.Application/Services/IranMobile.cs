using System.Text;
using System.Text.RegularExpressions;

namespace Krtakan.Application.Services;

/// <summary>Validates Iranian mobile numbers and normalizes them to the <c>09xxxxxxxxx</c> form.</summary>
public static partial class IranMobile
{
    [GeneratedRegex(@"^(?:\+98|0098|98|0)?(9\d{9})$")]
    private static partial Regex Pattern();

    public static bool TryNormalize(string? value, out string normalized)
    {
        normalized = string.Empty;
        if (string.IsNullOrWhiteSpace(value)) return false;

        var latin = new StringBuilder(value.Length);
        foreach (var c in value)
        {
            if (c is >= '۰' and <= '۹') latin.Append((char)('0' + (c - '۰')));
            else if (c is >= '٠' and <= '٩') latin.Append((char)('0' + (c - '٠')));
            else if (!char.IsWhiteSpace(c) && c is not '-' and not '(' and not ')') latin.Append(c);
        }

        var match = Pattern().Match(latin.ToString());
        if (!match.Success) return false;
        normalized = "0" + match.Groups[1].Value;
        return true;
    }
}
