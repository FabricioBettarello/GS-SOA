using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Domain.Entities;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Domain.ValueObjects;

namespace MonitoramentoOrbital.Api.Infrastructure.Data;

public sealed class MonitoramentoDbContext : DbContext, IUnitOfWork
{
    public MonitoramentoDbContext(DbContextOptions<MonitoramentoDbContext> options)
        : base(options) { }

    public DbSet<Satelite> Satelites => Set<Satelite>();
    public DbSet<Sensor> Sensores => Set<Sensor>();
    public DbSet<Leitura> Leituras => Set<Leitura>();
    public DbSet<Alerta> Alertas => Set<Alerta>();

    public Task<int> SalvarAsync(CancellationToken ct = default) => SaveChangesAsync(ct);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Satelite>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Nome).IsRequired().HasMaxLength(120);
            e.Property(s => s.CodigoInternacional).IsRequired().HasMaxLength(40);
            e.HasIndex(s => s.CodigoInternacional).IsUnique();
            e.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);

            e.HasDiscriminator<string>("TipoSatelite")
                .HasValue<SateliteObservacao>("Observacao")
                .HasValue<SateliteComunicacao>("Comunicacao")
                .HasValue<SateliteMeteorologico>("Meteorologico");

            e.OwnsOne(s => s.Posicao, p =>
            {
                p.Property(c => c.Latitude).HasColumnName("Latitude");
                p.Property(c => c.Longitude).HasColumnName("Longitude");
                p.Property(c => c.AltitudeKm).HasColumnName("AltitudeKm");
            });

            e.Navigation(s => s.Posicao).IsRequired();

            e.HasMany(s => s.Sensores)
                .WithOne(se => se.Satelite!)
                .HasForeignKey(se => se.SateliteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Sensor>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(s => s.Direcao).HasConversion<string>().HasMaxLength(10);
            e.Property(s => s.Unidade).IsRequired().HasMaxLength(20);

            e.HasMany(s => s.Leituras)
                .WithOne(l => l.Sensor!)
                .HasForeignKey(l => l.SensorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Leitura>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Valor).IsRequired();
            e.Property(l => l.MedidoEm).IsRequired();
        });

        modelBuilder.Entity<Alerta>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Severidade).HasConversion<string>().HasMaxLength(20);
            e.Property(a => a.Mensagem).IsRequired().HasMaxLength(400);

            e.HasOne(a => a.Satelite)
                .WithMany()
                .HasForeignKey(a => a.SateliteId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Leitura)
                .WithMany()
                .HasForeignKey(a => a.LeituraId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
