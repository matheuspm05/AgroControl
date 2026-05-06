using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class MovimentacaoAnimalService
{
    private readonly AppDbContext _context;

    public MovimentacaoAnimalService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MovimentacaoAnimalResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.MovimentacoesAnimais
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<MovimentacaoAnimalResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.MovimentacoesAnimais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<MovimentacaoAnimalResponseDto>> CreateAsync(int fazendaId, MovimentacaoAnimalCreateDto dto)
    {
        var animal = await _context.Animais.FirstOrDefaultAsync(x => x.Id == dto.AnimalId && x.FazendaId == fazendaId);
        var validation = await ValidateAsync(fazendaId, dto.AnimalId, dto.OrigemTipoLocal, dto.OrigemLocalId, dto.DestinoTipoLocal, dto.DestinoLocalId, animal);
        if (!validation.Success)
        {
            return ServiceResult<MovimentacaoAnimalResponseDto>.Validation(validation.ErrorMessage!);
        }

        var item = new MovimentacaoAnimal
        {
            FazendaId = fazendaId,
            AnimalId = dto.AnimalId,
            OrigemTipoLocal = dto.OrigemTipoLocal,
            OrigemLocalId = dto.OrigemLocalId,
            DestinoTipoLocal = dto.DestinoTipoLocal,
            DestinoLocalId = dto.DestinoLocalId,
            DataMovimentacao = dto.DataMovimentacao,
            Observacao = dto.Observacao
        };

        _context.MovimentacoesAnimais.Add(item);
        animal!.TipoLocalAtual = dto.DestinoTipoLocal;
        animal.LocalAtualId = dto.DestinoLocalId;

        await _context.SaveChangesAsync();

        return ServiceResult<MovimentacaoAnimalResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, MovimentacaoAnimalUpdateDto dto)
    {
        var item = await _context.MovimentacoesAnimais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var animal = await _context.Animais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dto.AnimalId && x.FazendaId == fazendaId);

        var validation = await ValidateAsync(fazendaId, dto.AnimalId, dto.OrigemTipoLocal, dto.OrigemLocalId, dto.DestinoTipoLocal, dto.DestinoLocalId, animal);
        if (!validation.Success)
        {
            return validation;
        }

        item.FazendaId = fazendaId;
        item.AnimalId = dto.AnimalId;
        item.OrigemTipoLocal = dto.OrigemTipoLocal;
        item.OrigemLocalId = dto.OrigemLocalId;
        item.DestinoTipoLocal = dto.DestinoTipoLocal;
        item.DestinoLocalId = dto.DestinoLocalId;
        item.DataMovimentacao = dto.DataMovimentacao;
        item.Observacao = dto.Observacao;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<bool> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.MovimentacoesAnimais.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return false;
        }

        _context.MovimentacoesAnimais.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<ServiceResult> ValidateAsync(
        int fazendaId,
        int animalId,
        TipoLocal? origemTipoLocal,
        int? origemLocalId,
        TipoLocal destinoTipoLocal,
        int destinoLocalId,
        Animal? animal)
    {
        if (animal is null)
        {
            return ServiceResult.Validation("AnimalId informado nao existe.");
        }

        if (animal.FazendaId != fazendaId)
        {
            return ServiceResult.Validation("O animal precisa pertencer a fazenda informada.");
        }

        if (origemTipoLocal.HasValue != origemLocalId.HasValue)
        {
            return ServiceResult.Validation("OrigemTipoLocal e OrigemLocalId devem ser informados juntos.");
        }

        if (origemTipoLocal.HasValue && origemLocalId.HasValue &&
            !await LocalPertenceAFazendaAsync(origemTipoLocal.Value, origemLocalId.Value, fazendaId))
        {
            return ServiceResult.Validation("Origem informada nao existe para a fazenda selecionada.");
        }

        if (!await LocalPertenceAFazendaAsync(destinoTipoLocal, destinoLocalId, fazendaId))
        {
            return ServiceResult.Validation("Destino informado nao existe para a fazenda selecionada.");
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
