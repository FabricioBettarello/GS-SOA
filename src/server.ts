import 'dotenv/config';
import { createApp } from './app';
import { criarServices } from './application';
import { prisma } from './infra/prisma/client';
import { criarRepositoriosPrisma } from './infra/prisma/repositories';

const PORT = Number(process.env.PORT ?? 3000);

async function main() {
  await prisma.$connect();
  const services = criarServices(criarRepositoriosPrisma(prisma));
  const app = createApp(services);

  const server = app.listen(PORT, () => {
    console.log(`AlagaAlerta API rodando em http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/docs`);
  });

  const encerrar = async (sinal: string) => {
    console.log(`${sinal} recebido, encerrando...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void encerrar('SIGINT'));
  process.on('SIGTERM', () => void encerrar('SIGTERM'));
}

main().catch(async (e) => {
  console.error('Falha ao iniciar a API:', e);
  await prisma.$disconnect();
  process.exit(1);
});
