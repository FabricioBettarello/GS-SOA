using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using MonitoramentoOrbital.Api.Api.Middleware;
using MonitoramentoOrbital.Api.Application.Services;
using MonitoramentoOrbital.Api.Domain.Interfaces;
using MonitoramentoOrbital.Api.Domain.Services;
using MonitoramentoOrbital.Api.Infrastructure.Data;
using MonitoramentoOrbital.Api.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=monitoramento.db";
builder.Services.AddDbContext<MonitoramentoDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<MonitoramentoDbContext>());
builder.Services.AddScoped<ISateliteRepository, SateliteRepository>();
builder.Services.AddScoped<IAlertaRepository, AlertaRepository>();

builder.Services.AddScoped<ISateliteService, SateliteService>();
builder.Services.AddScoped<ILeituraService, LeituraService>();
builder.Services.AddScoped<IAlertaService, AlertaService>();

builder.Services.AddSingleton<IAvaliadorAlerta, AvaliadorPorLimiar>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Monitoramento Orbital API",
        Version = "v1",
        Description = "WebService de monitoramento de satelites, sensores e alertas — Global Solution."
    });
});

var app = builder.Build();

app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MonitoramentoDbContext>();
    await SeedData.InicializarAsync(context);
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Monitoramento Orbital API v1");
    c.RoutePrefix = "swagger";
});

app.MapControllers();

app.Run();
