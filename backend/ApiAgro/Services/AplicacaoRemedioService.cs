using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Utils;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class AplicacaoRemedioService
{
    private readonly AppDbContext _context;

    public AplicacaoRemedioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AplicacaoRemedioResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.AplicacoesRemedio
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<AplicacaoRemedioResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.AplicacoesRemedio
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<AplicacaoRemedioResponseDto>> CreateAsync(int fazendaId, AplicacaoRemedioCreateDto dto)
    {
        var validation = await ValidateRelacionamentosAsync(fazendaId, dto.AnimalId, dto.RemedioId, false);
        if (!validation.Success)
        {
            return ServiceResult<AplicacaoRemedioResponseDto>.Validation(validation.ErrorMessage!);
        }

        var item = new AplicacaoRemedio
        {
            FazendaId = fazendaId,
            AnimalId = dto.AnimalId,
            RemedioId = dto.RemedioId,
            DoseAplicada = dto.DoseAplicada,
            DataAplicacao = DateTimeUtils.AsUtc(dto.DataAplicacao),
            Observacao = dto.Observacao,
            Ativo = dto.Ativo
        };

        _context.AplicacoesRemedio.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<AplicacaoRemedioResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, AplicacaoRemedioUpdateDto dto)
    {
        var item = await _context.AplicacoesRemedio.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var validation = await ValidateRelacionamentosAsync(fazendaId, dto.AnimalId, dto.RemedioId, true);
        if (!validation.Success)
        {
            return validation;
        }

        item.FazendaId = fazendaId;
        item.AnimalId = dto.AnimalId;
        item.RemedioId = dto.RemedioId;
        item.DoseAplicada = dto.DoseAplicada;
        item.DataAplicacao = DateTimeUtils.AsUtc(dto.DataAplicacao);
        item.Observacao = dto.Observacao;
        item.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<bool> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.AplicacoesRemedio.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return false;
        }

        _context.AplicacoesRemedio.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<ServiceResult> ValidateRelacionamentosAsync(int fazendaId, int animalId, int remedioId, bool combinedMissingMessage)
    {
        var animal = await _context.Animais
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == animalId);

        if (animal is null)
        {
            return ServiceResult.Validation(
                combinedMissingMessage
                    ? "AnimalId ou RemedioId informado nao existe."
                    : "AnimalId informado nao existe.");
        }

        var remedio = await _context.Remedios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == remedioId);

        if (remedio is null)
        {
            return ServiceResult.Validation(
                combinedMissingMessage
                    ? "AnimalId ou RemedioId informado nao existe."
                    : "RemedioId informado nao existe.");
        }

        if (!remedio.Ativo)
        {
            return ServiceResult.Validation("Remedio informado esta inativo.");
        }

        if (animal.FazendaId != fazendaId || remedio.FazendaId != fazendaId)
        {
            return ServiceResult.Validation("Animal, remedio e fazenda precisam pertencer a mesma fazenda.");
        }

        return ServiceResult.Ok();
    }
}
