using System.Security.Cryptography;
using System.Text;
using ApiAgro.Data;
using ApiAgro.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public record RefreshTokenSession(Usuario Usuario, string RefreshToken, DateTime ExpiresAt);

public class RefreshTokenService
{
    private const int TokenByteLength = 64;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public RefreshTokenService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<RefreshTokenSession> CreateSessionAsync(Usuario usuario, string? clientIp)
    {
        var plainToken = GeneratePlainToken();
        var refreshToken = new RefreshToken
        {
            UsuarioId = usuario.Id,
            TokenHash = HashToken(plainToken),
            ExpiresAt = DateTime.UtcNow.AddDays(GetExpirationDays()),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = clientIp
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new RefreshTokenSession(usuario, plainToken, refreshToken.ExpiresAt);
    }
 
    public async Task<RefreshTokenSession?> RotateAsync(string plainToken, string? clientIp)
    {
        var tokenHash = HashToken(plainToken);
        var existingToken = await _context.RefreshTokens
            .Include(x => x.Usuario)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (existingToken is null)
        {
            return null;
        }

        if (!existingToken.IsActive)
        {
            if (existingToken.IsRevoked)
            {
                await RevokeActiveTokensAsync(existingToken.UsuarioId, clientIp);
            }

            return null;
        }

        var newPlainToken = GeneratePlainToken();
        var newTokenHash = HashToken(newPlainToken);
        var newRefreshToken = new RefreshToken
        {
            UsuarioId = existingToken.UsuarioId,
            TokenHash = newTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(GetExpirationDays()),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = clientIp
        };

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.RevokedByIp = clientIp;
        existingToken.ReplacedByTokenHash = newTokenHash;

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        return new RefreshTokenSession(existingToken.Usuario!, newPlainToken, newRefreshToken.ExpiresAt);
    }

    public async Task<bool> RevokeAsync(string plainToken, string? clientIp)
    {
        var tokenHash = HashToken(plainToken);
        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (existingToken is null || !existingToken.IsActive)
        {
            return false;
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.RevokedByIp = clientIp;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task RevokeActiveTokensAsync(int usuarioId, string? clientIp)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(x => x.UsuarioId == usuarioId && x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = clientIp;
        }

        await _context.SaveChangesAsync();
    }

    private int GetExpirationDays() =>
        Math.Max(1, _configuration.GetValue("RefreshToken:ExpirationDays", 7));

    private static string GeneratePlainToken() =>
        WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(TokenByteLength));

    private static string HashToken(string token)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes);
    }
}
