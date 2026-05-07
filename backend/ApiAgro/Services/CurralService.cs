using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Utils;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class CurralService
{
    private readonly AppDbContext _context;

    public CurralService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CurralResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.Currais
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<CurralResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.Currais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<IEnumerable<AnimalResponseDto>>> GetAnimaisAsync(int id, int fazendaId)
    {
        var curral = await _context.Currais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        if (curral is null)
        {
            return ServiceResult<IEnumerable<AnimalResponseDto>>.NotFound();
        }

        var animais = await _context.Animais
            .AsNoTracking()
            .Where(x =>
                x.TipoLocalAtual == TipoLocal.Curral &&
                x.LocalAtualId == id &&
                x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return ServiceResult<IEnumerable<AnimalResponseDto>>.Ok(animais.Select(x => x.ToResponseDto()));
    }

    public async Task<ServiceResult<CurralResponseDto>> CreateAsync(int fazendaId, CurralCreateDto dto)
    {
        var item = new Curral
        {
            FazendaId = fazendaId,
            Nome = dto.Nome,
            CapacidadeMaxima = dto.CapacidadeMaxima,
            DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? DateTime.UtcNow
        };

        _context.Currais.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<CurralResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, CurralUpdateDto dto)
    {
        var item = await _context.Currais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        item.FazendaId = fazendaId;
        item.Nome = dto.Nome;
        item.CapacidadeMaxima = dto.CapacidadeMaxima;
        item.DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? item.DataCadastro;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.Currais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var hasAnimaisVinculados = await _context.Animais
            .AsNoTracking()
            .AnyAsync(x =>
                x.FazendaId == fazendaId &&
                x.TipoLocalAtual == TipoLocal.Curral &&
                x.LocalAtualId == item.Id);

        if (hasAnimaisVinculados)
        {
            return ServiceResult.Validation(
                "Nao e possivel excluir este curral porque existem animais vinculados a ele. Movimente os animais antes de excluir.");
        }

        _context.Currais.Remove(item);
        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }
}
