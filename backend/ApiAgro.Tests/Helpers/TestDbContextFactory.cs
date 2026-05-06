using ApiAgro.Data;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Tests.Helpers;

internal static class TestDbContextFactory
{
    public static AppDbContext Create(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString("N"))
            .Options;

        return new AppDbContext(options);
    }
}
