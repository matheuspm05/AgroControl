using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Utils;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class PastoService
{
    private readonly AppDbContext _context;

    public PastoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PastoResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.Pastos
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<PastoResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.Pastos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<IEnumerable<AnimalResponseDto>>> GetAnimaisAsync(int id, int fazendaId)
    {
        var pasto = await _context.Pastos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        if (pasto is null)
        {
            return ServiceResult<IEnumerable<AnimalResponseDto>>.NotFound();
        }

        var animais = await _context.Animais
            .AsNoTracking()
            .Where(x =>
                x.TipoLocalAtual == TipoLocal.Pasto &&
                x.LocalAtualId == id &&
                x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return ServiceResult<IEnumerable<AnimalResponseDto>>.Ok(animais.Select(x => x.ToResponseDto()));
    }

    public async Task<ServiceResult<PastoResponseDto>> CreateAsync(int fazendaId, PastoCreateDto dto)
    {
        var item = new Pasto
        {
            FazendaId = fazendaId,
            Nome = dto.Nome,
            Tamanho = dto.Tamanho,
            TipoVegetacao = dto.TipoVegetacao,
            DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? DateTime.UtcNow
        };

        _context.Pastos.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<PastoResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, PastoUpdateDto dto)
    {
        var item = await _context.Pastos.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        item.FazendaId = fazendaId;
        item.Nome = dto.Nome;
        item.Tamanho = dto.Tamanho;
        item.TipoVegetacao = dto.TipoVegetacao;
        item.DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? item.DataCadastro;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.Pastos.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var hasAnimaisVinculados = await _context.Animais
            .AsNoTracking()
            .AnyAsync(x =>
                x.FazendaId == fazendaId &&
                x.TipoLocalAtual == TipoLocal.Pasto &&
                x.LocalAtualId == item.Id);

        if (hasAnimaisVinculados)
        {
            return ServiceResult.Validation(
                "Nao e possivel excluir este pasto porque existem animais vinculados a ele. Movimente os animais antes de excluir.");
        }

        _context.Pastos.Remove(item);
        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }
}
