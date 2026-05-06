using ApiAgro.DTOs;
using ApiAgro.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiAgro.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected int GetUsuarioId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out var usuarioId))
        {
            throw new InvalidOperationException("Usuario autenticado sem identificador valido.");
        }

        return usuarioId;
    }

    protected Task<int?> GetFazendaIdAsync(FazendaService fazendaService) =>
        fazendaService.GetFazendaIdByUsuarioIdAsync(GetUsuarioId());

    protected ActionResult FazendaRequiredResponse() =>
        ValidationError("Cadastre uma fazenda antes de acessar este recurso.");

    protected ActionResult NotFoundResponse(string message = "Registro nao encontrado.")
    {
        return NotFound(new ApiErrorResponse("not_found", message));
    }

    protected ActionResult ValidationError(string? message)
    {
        return BadRequest(new ApiErrorResponse(
            "validation_error",
            string.IsNullOrWhiteSpace(message) ? "Dados invalidos." : message));
    }

    protected ActionResult FromServiceError(ServiceResult result, string notFoundMessage = "Registro nao encontrado.")
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFoundResponse(notFoundMessage),
            ServiceErrorType.Validation => ValidationError(result.ErrorMessage),
            _ => BadRequest(new ApiErrorResponse("unexpected_error", "Nao foi possivel concluir a operacao."))
        };
    }
}
