using ApiAgro.DTOs;
using ApiAgro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAgro.Controllers;

[ApiController]
[Authorize]
[Route("api/currais")]
public class CurraisController : ApiControllerBase
{
    private readonly CurralService _service;
    private readonly FazendaService _fazendaService;

    public CurraisController(CurralService service, FazendaService fazendaService)
    {
        _service = service;
        _fazendaService = fazendaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CurralResponseDto>>> GetAll()
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
    public async Task<ActionResult<CurralResponseDto>> GetById(int id)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var item = await _service.GetByIdAsync(id, fazendaId.Value);
        return item is null ? NotFoundResponse("Curral nao encontrado.") : Ok(item);
    }

    [HttpGet("{id:int}/animais")]
    public async Task<ActionResult<IEnumerable<AnimalResponseDto>>> GetAnimais(int id)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.GetAnimaisAsync(id, fazendaId.Value);
        if (!result.Success)
        {
            return FromServiceError(result, "Curral nao encontrado.");
        }

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<CurralResponseDto>> Create(CurralCreateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.CreateAsync(fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Curral nao encontrado.");
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CurralUpdateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.UpdateAsync(id, fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Curral nao encontrado.");
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
            return FromServiceError(result, "Curral nao encontrado.");
        }

        return NoContent();
    }
}
