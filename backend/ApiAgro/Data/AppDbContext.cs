using ApiAgro.Models;
using ApiAgro.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Fazenda> Fazendas => Set<Fazenda>();
    public DbSet<Animal> Animais => Set<Animal>();
    public DbSet<Pasto> Pastos => Set<Pasto>();
    public DbSet<Curral> Currais => Set<Curral>();
    public DbSet<Remedio> Remedios => Set<Remedio>();
    public DbSet<AplicacaoRemedio> AplicacoesRemedio => Set<AplicacaoRemedio>();
    public DbSet<MovimentacaoAnimal> MovimentacoesAnimais => Set<MovimentacaoAnimal>();
    public DbSet<Campeiro> Campeiros => Set<Campeiro>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SenhaHash).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Contato).HasMaxLength(80);
            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(x => x.ReplacedByTokenHash).HasMaxLength(128);
            entity.Property(x => x.CreatedByIp).HasMaxLength(80);
            entity.Property(x => x.RevokedByIp).HasMaxLength(80);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => x.UsuarioId);
            entity.HasOne(x => x.Usuario)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Fazenda>(entity =>
        {
            entity.ToTable("Fazendas");
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Localizacao).HasMaxLength(200);
            entity.Property(x => x.Descricao).HasMaxLength(500);
            entity.Property(x => x.TamanhoPropriedade).HasPrecision(10, 2);
            entity.HasIndex(x => x.UsuarioId).IsUnique();
            entity.HasOne(x => x.Usuario)
                .WithOne(x => x.Fazenda)
                .HasForeignKey<Fazenda>(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Animal>(entity =>
        {
            entity.ToTable("Animais");
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Peso).HasPrecision(10, 2);
            entity.Property(x => x.TipoAnimal).HasConversion<string>();
            entity.Property(x => x.TipoLocalAtual).HasConversion<string>();
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.Animais)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Pasto>(entity =>
        {
            entity.ToTable("Pastos");
            entity.Property(x => x.Nome).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Tamanho).HasPrecision(10, 2);
            entity.Property(x => x.TipoVegetacao).HasMaxLength(120);
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.Pastos)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Curral>(entity =>
        {
            entity.ToTable("Currais");
            entity.Property(x => x.Nome).HasMaxLength(120).IsRequired();
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.Currais)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Remedio>(entity =>
        {
            entity.ToTable("Remedios");
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Descricao).HasMaxLength(500);
            entity.Property(x => x.DosePadrao).HasPrecision(10, 2);
            entity.Property(x => x.Ativo).HasDefaultValue(true);
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.Remedios)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AplicacaoRemedio>(entity =>
        {
            entity.ToTable("AplicacoesRemedio");
            entity.Property(x => x.DoseAplicada).HasPrecision(10, 2);
            entity.Property(x => x.Observacao).HasMaxLength(500);
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.AplicacoesRemedio)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Animal)
                .WithMany(x => x.AplicacoesRemedio)
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Remedio)
                .WithMany(x => x.Aplicacoes)
                .HasForeignKey(x => x.RemedioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MovimentacaoAnimal>(entity =>
        {
            entity.ToTable("MovimentacoesAnimais");
            entity.Property(x => x.OrigemTipoLocal).HasConversion<string>();
            entity.Property(x => x.DestinoTipoLocal).HasConversion<string>();
            entity.Property(x => x.Observacao).HasMaxLength(500);
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.MovimentacoesAnimais)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Animal)
                .WithMany(x => x.Movimentacoes)
                .HasForeignKey(x => x.AnimalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Campeiro>(entity =>
        {
            entity.ToTable("Campeiros");
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Salario).HasPrecision(10, 2);
            entity.Property(x => x.EstadoCivil).HasMaxLength(50);
            entity.Property(x => x.Telefone).HasMaxLength(30);
            entity.Property(x => x.Cpf).HasMaxLength(20);
            entity.Property(x => x.Observacoes).HasMaxLength(500);
            entity.HasOne(x => x.Fazenda)
                .WithMany(x => x.Campeiros)
                .HasForeignKey(x => x.FazendaId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
