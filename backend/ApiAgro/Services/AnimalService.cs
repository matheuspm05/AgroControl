using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class AnimalService
{
    private readonly AppDbContext _context;

    public AnimalService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AnimalResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.Animais
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<AnimalResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.Animais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<AnimalResponseDto>> CreateAsync(int fazendaId, AnimalCreateDto dto)
    {
        var validation = await ValidateLocalAtualAsync(fazendaId, dto.TipoLocalAtual, dto.LocalAtualId);
        if (!validation.Success)
        {
            return ServiceResult<AnimalResponseDto>.Validation(validation.ErrorMessage!);
        }

        var item = new Animal
        {
            FazendaId = fazendaId,
            Nome = dto.Nome,
            TipoAnimal = dto.TipoAnimal,
            DataNascimento = dto.DataNascimento,
            Peso = dto.Peso,
            DataCadastro = dto.DataCadastro ?? DateTime.UtcNow,
            TipoLocalAtual = dto.TipoLocalAtual,
            LocalAtualId = dto.LocalAtualId
        };

        _context.Animais.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<AnimalResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, AnimalUpdateDto dto)
    {
        var item = await _context.Animais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var validation = await ValidateLocalAtualAsync(fazendaId, dto.TipoLocalAtual, dto.LocalAtualId);
        if (!validation.Success)
        {
            return validation;
        }

        item.FazendaId = fazendaId;
        item.Nome = dto.Nome;
        item.TipoAnimal = dto.TipoAnimal;
        item.DataNascimento = dto.DataNascimento;
        item.Peso = dto.Peso;
        item.DataCadastro = dto.DataCadastro ?? item.DataCadastro;
        item.TipoLocalAtual = dto.TipoLocalAtual;
        item.LocalAtualId = dto.LocalAtualId;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<bool> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.Animais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return false;
        }

        _context.Animais.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<ServiceResult> ValidateLocalAtualAsync(
        int fazendaId,
        TipoLocal tipoLocal,
        int localId)
    {
        if (!await LocalPertenceAFazendaAsync(tipoLocal, localId, fazendaId))
        {
            return ServiceResult.Validation("LocalAtualId informado nao existe para o tipo e fazenda selecionados.");
        }

        return ServiceResult.Ok();
    }

    private Task<bool> LocalPertenceAFazendaAsync(TipoLocal tipoLocal, int localId, int fazendaId)
    {
        return tipoLocal switch
        {
            TipoLocal.Pasto => _context.Pastos.AnyAsync(x => x.Id == localId && x.FazendaId == fazendaId),
            TipoLocal.Curral => _context.Currais.AnyAsync(x => x.Id == localId && x.FazendaId == fazendaId),
            _ => Task.FromResult(false)
        };
    }
}
