using ApiAgro.DTOs;
using ApiAgro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAgro.Controllers;

[ApiController]
[Authorize]
[Route("api/remedios")]
public class RemediosController : ApiControllerBase
{
    private readonly RemedioService _service;
    private readonly FazendaService _fazendaService;

    public RemediosController(RemedioService service, FazendaService fazendaService)
    {
        _service = service;
        _fazendaService = fazendaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RemedioResponseDto>>> GetAll()
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var items = await _service.GetAllAsync(fazendaId.Value);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RemedioResponseDto>> GetById(int id)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var item = await _service.GetByIdAsync(id, fazendaId.Value);
        return item is null ? NotFoundResponse("Remedio nao encontrado.") : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<RemedioResponseDto>> Create(RemedioCreateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.CreateAsync(fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Remedio nao encontrado.");
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RemedioUpdateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.UpdateAsync(id, fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Remedio nao encontrado.");
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.DeleteAsync(id, fazendaId.Value);
        if (!result.Success)
        {
            return FromServiceError(result, "Remedio nao encontrado.");
        }

        return NoContent();
    }
}
