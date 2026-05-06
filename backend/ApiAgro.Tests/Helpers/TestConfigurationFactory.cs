using Microsoft.Extensions.Configuration;

namespace ApiAgro.Tests.Helpers;

internal static class TestConfigurationFactory
{
    public static IConfiguration Create() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-key-with-at-least-thirty-two-characters",
                ["Jwt:Issuer"] = "AgroControl.Tests",
                ["Jwt:Audience"] = "AgroControl.Tests.Client",
                ["Jwt:ExpirationMinutes"] = "120"
            })
            .Build();
}
