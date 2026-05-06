namespace ApiAgro.Services;

public enum ServiceErrorType
{
    None,
    NotFound,
    Validation
}

public class ServiceResult
{
    public bool Success => ErrorType == ServiceErrorType.None;
    public ServiceErrorType ErrorType { get; init; }
    public string? ErrorMessage { get; init; }

    public static ServiceResult Ok() => new();

    public static ServiceResult NotFound() => new()
    {
        ErrorType = ServiceErrorType.NotFound
    };

    public static ServiceResult Validation(string message) => new()
    {
        ErrorType = ServiceErrorType.Validation,
        ErrorMessage = message
    };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }

    public static ServiceResult<T> Ok(T data) => new()
    {
        Data = data
    };

    public static new ServiceResult<T> NotFound() => new()
    {
        ErrorType = ServiceErrorType.NotFound
    };

    public static new ServiceResult<T> Validation(string message) => new()
    {
        ErrorType = ServiceErrorType.Validation,
        ErrorMessage = message
    };
}
