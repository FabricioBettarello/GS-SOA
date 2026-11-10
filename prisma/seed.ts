import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.relato.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.leitura.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.pontoRisco.deleteMany();
  await prisma.bairro.deleteMany();

  const pompeia = await prisma.bairro.create({ data: { nome: 'Pompeia', zona: 'OESTE' } });
  const se = await prisma.bairro.create({ data: { nome: 'Sé', zona: 'CENTRO' } });
  const aricanduva = await prisma.bairro.create({ data: { nome: 'Aricanduva', zona: 'LESTE' } });

  const pontoPompeia = await prisma.pontoRisco.create({
    data: {
      nome: 'Av. Pompeia x R. Turiassu',
      descricao: 'Baixada que recebe água do córrego canalizado em chuvas fortes',
      latitude: -23.5305,
      longitude: -46.6835,
      nivelAtencaoCm: 15,
      nivelCriticoCm: 30,
      bairroId: pompeia.id,
    },
  });

  const pontoBandeira = await prisma.pontoRisco.create({
    data: {
      nome: 'Praça da Bandeira',
      descricao: 'Ponto de acúmulo de água no centro',
      latitude: -23.5489,
      longitude: -46.6388,
      nivelAtencaoCm: 10,
      nivelCriticoCm: 25,
      bairroId: se.id,
    },
  });

  const pontoAricanduva = await prisma.pontoRisco.create({
    data: {
      nome: 'Av. Aricanduva (trecho do córrego)',
      descricao: 'Córrego Aricanduva transborda em chuvas intensas',
      latitude: -23.564,
      longitude: -46.511,
      nivelAtencaoCm: 20,
      nivelCriticoCm: 40,
      bairroId: aricanduva.id,
    },
  });

  const s1 = await prisma.sensor.create({ data: { codigo: 'ESP32-POMPEIA-01', pontoRiscoId: pontoPompeia.id } });
  await prisma.sensor.create({ data: { codigo: 'ESP32-BANDEIRA-01', pontoRiscoId: pontoBandeira.id } });
  await prisma.sensor.create({ data: { codigo: 'ESP32-ARICANDUVA-01', pontoRiscoId: pontoAricanduva.id } });

  const agora = Date.now();
  const historico: Array<[number, number, number]> = [
    [60, 2, 0],
    [45, 6, 8],
    [30, 11, 22],
    [15, 9, 15],
  ];
  for (const [minAtras, nivel, chuva] of historico) {
    await prisma.leitura.create({
      data: {
        sensorId: s1.id,
        nivelAguaCm: nivel,
        chuvaMmHora: chuva,
        registradaEm: new Date(agora - minAtras * 60_000),
      },
    });
  }

  await prisma.relato.create({
    data: {
      bairroId: aricanduva.id,
      pontoRiscoId: pontoAricanduva.id,
      descricao: 'Água chegando na calçada perto do ponto de ônibus',
      intensidade: 'MEDIA',
    },
  });

  console.log('Seed concluído: 3 bairros, 3 pontos de risco, 3 sensores.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
