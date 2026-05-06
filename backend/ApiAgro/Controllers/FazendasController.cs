using ApiAgro.DTOs;
using ApiAgro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAgro.Controllers;

[ApiController]
[Authorize]
[Route("api/fazendas")]
public class FazendasController : ApiControllerBase
{
    private readonly FazendaService _service;

    public FazendasController(FazendaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FazendaResponseDto>>> GetAll()
    {
        var items = await _service.GetAllAsync(GetUsuarioId());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FazendaResponseDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id, GetUsuarioId());
        return item is null ? NotFoundResponse("Fazenda nao encontrada.") : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<FazendaResponseDto>> Create(FazendaCreateDto dto)
    {
        var result = await _service.CreateAsync(GetUsuarioId(), dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Fazenda nao encontrada.");
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, FazendaUpdateDto dto)
    {
        var result = await _service.UpdateAsync(id, GetUsuarioId(), dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Fazenda nao encontrada.");
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id, GetUsuarioId());
        return deleted ? NoContent() : NotFoundResponse("Fazenda nao encontrada.");
    }
}
