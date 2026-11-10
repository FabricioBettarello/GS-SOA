import cors from 'cors';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Services } from './application';
import { errorHandler, notFoundHandler } from './http/middlewares';
import { gerarDocumentoOpenApi } from './http/openapi';
import { criarRotas } from './http/routes';

export function createApp(services: Services): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', servico: 'alagaalerta-api', horario: new Date().toISOString() });
  });

  const documento = gerarDocumentoOpenApi();
  const swaggerDoc = documento as unknown as Record<string, unknown>;
  app.get('/docs.json', (_req, res) => {
    res.json(documento);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { customSiteTitle: 'AlagaAlerta API' }));

  app.use('/api/v1', criarRotas(services));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
