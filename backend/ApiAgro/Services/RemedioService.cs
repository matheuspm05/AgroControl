using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Utils;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class RemedioService
{
    private readonly AppDbContext _context;

    public RemedioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RemedioResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.Remedios
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<RemedioResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.Remedios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<RemedioResponseDto>> CreateAsync(int fazendaId, RemedioCreateDto dto)
    {
        var item = new Remedio
        {
            FazendaId = fazendaId,
            Nome = dto.Nome,
            DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? DateTime.UtcNow,
            Descricao = dto.Descricao,
            DosePadrao = dto.DosePadrao,
            Ativo = dto.Ativo
        };

        _context.Remedios.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<RemedioResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, RemedioUpdateDto dto)
    {
        var item = await _context.Remedios.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        item.FazendaId = fazendaId;
        item.Nome = dto.Nome;
        item.DataCadastro = DateTimeUtils.AsUtc(dto.DataCadastro) ?? item.DataCadastro;
        item.Descricao = dto.Descricao;
        item.DosePadrao = dto.DosePadrao;
        item.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.Remedios.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        var hasAplicacoes = await _context.AplicacoesRemedio
            .AsNoTracking()
            .AnyAsync(x => x.RemedioId == item.Id && x.FazendaId == fazendaId);

        if (hasAplicacoes)
        {
            return ServiceResult.Validation(
                "Nao e possivel excluir este remedio porque ele ja possui aplicacoes registradas. Desative o remedio em vez de excluir.");
        }

        _context.Remedios.Remove(item);
        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }
}
