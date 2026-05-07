using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Utils;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Services;

public class FazendaService
{
    private readonly AppDbContext _context;

    public FazendaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int?> GetFazendaIdByUsuarioIdAsync(int usuarioId)
    {
        return await _context.Fazendas
            .AsNoTracking()
            .Where(x => x.UsuarioId == usuarioId)
            .Select(x => (int?)x.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<FazendaResponseDto>> GetAllAsync(int usuarioId)
    {
        var items = await _context.Fazendas
            .AsNoTracking()
            .Where(x => x.UsuarioId == usuarioId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return items.Select(x => x.ToResponseDto());
    }

    public async Task<FazendaResponseDto?> GetByIdAsync(int id, int usuarioId)
    {
        var item = await _context.Fazendas
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UsuarioId == usuarioId);

        return item?.ToResponseDto();
    }

    public async Task<ServiceResult<FazendaResponseDto>> CreateAsync(int usuarioId, FazendaCreateDto dto)
    {
        var usuarioExists = await _context.Usuarios.AnyAsync(x => x.Id == usuarioId);
        if (!usuarioExists)
        {
            return ServiceResult<FazendaResponseDto>.Validation("Usuario autenticado nao existe.");
        }

        var alreadyHasFazenda = await _context.Fazendas.AnyAsync(x => x.UsuarioId == usuarioId);
        if (alreadyHasFazenda)
        {
            return ServiceResult<FazendaResponseDto>.Validation("Este usuario ja possui uma fazenda cadastrada.");
        }

        var item = new Fazenda
        {
            UsuarioId = usuarioId,
            Nome = dto.Nome,
            Localizacao = dto.Localizacao,
            DataCriacao = DateTimeUtils.AsUtc(dto.DataCriacao) ?? DateTime.UtcNow,
            TamanhoPropriedade = dto.TamanhoPropriedade,
            Descricao = dto.Descricao
        };

        _context.Fazendas.Add(item);
        await _context.SaveChangesAsync();

        return ServiceResult<FazendaResponseDto>.Ok(item.ToResponseDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, int usuarioId, FazendaUpdateDto dto)
    {
        var item = await _context.Fazendas.FirstOrDefaultAsync(x => x.Id == id && x.UsuarioId == usuarioId);
        if (item is null)
        {
            return ServiceResult.NotFound();
        }

        item.Nome = dto.Nome;
        item.Localizacao = dto.Localizacao;
        item.DataCriacao = DateTimeUtils.AsUtc(dto.DataCriacao) ?? item.DataCriacao;
        item.TamanhoPropriedade = dto.TamanhoPropriedade;
        item.Descricao = dto.Descricao;

        await _context.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task<bool> DeleteAsync(int id, int usuarioId)
    {
        var item = await _context.Fazendas.FirstOrDefaultAsync(x => x.Id == id && x.UsuarioId == usuarioId);
        if (item is null)
        {
            return false;
        }

        _context.Fazendas.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
