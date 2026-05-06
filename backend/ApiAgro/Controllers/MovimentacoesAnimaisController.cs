using ApiAgro.DTOs;
using ApiAgro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAgro.Controllers;

[ApiController]
[Authorize]
[Route("api/movimentacoes-animais")]
public class MovimentacoesAnimaisController : ApiControllerBase
{
    private readonly MovimentacaoAnimalService _service;
    private readonly FazendaService _fazendaService;

    public MovimentacoesAnimaisController(MovimentacaoAnimalService service, FazendaService fazendaService)
    {
        _service = service;
        _fazendaService = fazendaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovimentacaoAnimalResponseDto>>> GetAll()
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
    public async Task<ActionResult<MovimentacaoAnimalResponseDto>> GetById(int id)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var item = await _service.GetByIdAsync(id, fazendaId.Value);
        return item is null ? NotFoundResponse("Movimentacao de animal nao encontrada.") : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<MovimentacaoAnimalResponseDto>> Create(MovimentacaoAnimalCreateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.CreateAsync(fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Movimentacao de animal nao encontrada.");
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MovimentacaoAnimalUpdateDto dto)
    {
        var fazendaId = await GetFazendaIdAsync(_fazendaService);
        if (fazendaId is null)
        {
            return FazendaRequiredResponse();
        }

        var result = await _service.UpdateAsync(id, fazendaId.Value, dto);
        if (!result.Success)
        {
            return FromServiceError(result, "Movimentacao de animal nao encontrada.");
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

        var deleted = await _service.DeleteAsync(id, fazendaId.Value);
        return deleted ? NoContent() : NotFoundResponse("Movimentacao de animal nao encontrada.");
    }
}
