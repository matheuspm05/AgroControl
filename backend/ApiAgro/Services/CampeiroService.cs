using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class CampeiroService
{
    private readonly AppDbContext _context;

    public CampeiroService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CampeiroResponseDto>> GetAllAsync(int fazendaId)
    {
        var items = await _context.Campeiros
            .AsNoTracking()
            .Where(x => x.FazendaId == fazendaId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<CampeiroResponseDto?> GetByIdAsync(int id, int fazendaId)
    {
        var item = await _context.Campeiros
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<CampeiroResponseDto>> CreateAsync(int fazendaId, CampeiroCreateDto dto)
    {
        var item = new Campeiro
        {
            FazendaId = fazendaId,
            Nome = dto.Nome,
            DataAdmissao = dto.DataAdmissao,
            Salario = dto.Salario,
            EstadoCivil = dto.EstadoCivil,
            Telefone = dto.Telefone,
            Cpf = dto.Cpf,
            Observacoes = dto.Observacoes
        };

        _context.Campeiros.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<CampeiroResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int fazendaId, CampeiroUpdateDto dto)
    {
        var item = await _context.Campeiros.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        item.FazendaId = fazendaId;
        item.Nome = dto.Nome;
        item.DataAdmissao = dto.DataAdmissao;
        item.Salario = dto.Salario;
        item.EstadoCivil = dto.EstadoCivil;
        item.Telefone = dto.Telefone;
        item.Cpf = dto.Cpf;
        item.Observacoes = dto.Observacoes;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<bool> DeleteAsync(int id, int fazendaId)
    {
        var item = await _context.Campeiros.FirstOrDefaultAsync(x => x.Id == id && x.FazendaId == fazendaId);
        if (item is null)
        {
            return false;
        }

        _context.Campeiros.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
