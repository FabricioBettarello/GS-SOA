import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { INTENSIDADES_RELATO, NIVEIS_ALERTA, STATUS_RELATO, ZONAS } from '../domain/entities';

extendZodWithOpenApi(z);

const uuid = z.string().uuid();
const dataHora = z.string().datetime({ offset: true });
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const IdParam = z.object({
  id: uuid.openapi({ example: '3f1c2b9e-6d1a-4c55-9a0b-1b2c3d4e5f60' }),
});

export const ListarPontosQuery = z.object({ bairroId: uuid.optional() });
export const ListarSensoresQuery = z.object({ pontoRiscoId: uuid.optional() });
export const HistoricoQuery = z.object({
  limite: z.coerce.number().int().min(1).max(500).default(50).openapi({ example: 50 }),
});
export const ListarAlertasQuery = z.object({
  ativos: z.enum(['true', 'false']).optional().openapi({ description: 'true = só alertas em andamento' }),
  bairroId: uuid.optional(),
});
export const ListarRelatosQuery = z.object({
  bairroId: uuid.optional(),
  status: z.enum(STATUS_RELATO).optional(),
});

export const CriarBairroBody = z
  .object({
    nome: z.string().trim().min(2).max(80).openapi({ example: 'Pompeia' }),
    zona: z.enum(ZONAS).openapi({ example: 'OESTE' }),
  })
  .openapi('CriarBairro');

const pontoRiscoCampos = z.object({
  nome: z.string().trim().min(3).max(120).openapi({ example: 'Av. Pompeia x R. Turiassu' }),
  descricao: z.string().trim().max(500).nullable().optional(),
  latitude: latitude.openapi({ example: -23.5305 }),
  longitude: longitude.openapi({ example: -46.6835 }),
  nivelAtencaoCm: z.number().positive().openapi({ example: 15, description: 'Nível de água (cm) que gera ATENÇÃO' }),
  nivelCriticoCm: z.number().positive().openapi({ example: 30, description: 'Nível de água (cm) que gera CRÍTICO' }),
  bairroId: uuid,
});

export const CriarPontoRiscoBody = pontoRiscoCampos.openapi('CriarPontoRisco');
export const AtualizarPontoRiscoBody = pontoRiscoCampos.partial().openapi('AtualizarPontoRisco');

export const CriarSensorBody = z
  .object({
    codigo: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,40}$/, 'Use letras, números e hífen (3 a 40 caracteres)')
      .openapi({ example: 'ESP32-POMPEIA-01' }),
    pontoRiscoId: uuid,
    ativo: z.boolean().default(true),
  })
  .openapi('CriarSensor');

export const AtualizarSensorBody = z.object({ ativo: z.boolean() }).openapi('AtualizarSensor');

export const RegistrarLeituraBody = z
  .object({
    codigoSensor: z.string().trim().toUpperCase().min(3).openapi({ example: 'ESP32-POMPEIA-01' }),
    nivelAguaCm: z.number().min(0).max(1000).openapi({ example: 32.5, description: 'Altura da água medida pelo sensor' }),
    chuvaMmHora: z.number().min(0).max(500).optional().openapi({ example: 40 }),
    registradaEm: dataHora.optional().openapi({ description: 'Se omitido, usa a hora do servidor' }),
  })
  .openapi('RegistrarLeitura');

export const CriarRelatoBody = z
  .object({
    bairroId: uuid,
    pontoRiscoId: uuid.optional(),
    descricao: z.string().trim().min(5).max(500).openapi({ example: 'Água cobrindo a calçada na esquina' }),
    intensidade: z.enum(INTENSIDADES_RELATO).openapi({ example: 'ALTA' }),
    latitude: latitude.optional(),
    longitude: longitude.optional(),
  })
  .openapi('CriarRelato');

export const ModerarRelatoBody = z
  .object({ status: z.enum(['CONFIRMADO', 'DESCARTADO']) })
  .openapi('ModerarRelato');

export const BairroSchema = z
  .object({ id: uuid, nome: z.string(), zona: z.enum(ZONAS), createdAt: dataHora })
  .openapi('Bairro');

export const PontoRiscoSchema = z
  .object({
    id: uuid,
    nome: z.string(),
    descricao: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
    nivelAtencaoCm: z.number(),
    nivelCriticoCm: z.number(),
    bairroId: uuid,
    createdAt: dataHora,
    updatedAt: dataHora,
  })
  .openapi('PontoRisco');

export const SensorSchema = z
  .object({ id: uuid, codigo: z.string(), ativo: z.boolean(), pontoRiscoId: uuid, createdAt: dataHora })
  .openapi('Sensor');

export const LeituraSchema = z
  .object({
    id: uuid,
    nivelAguaCm: z.number(),
    chuvaMmHora: z.number().nullable(),
    registradaEm: dataHora,
    sensorId: uuid,
  })
  .openapi('Leitura');

export const AlertaSchema = z
  .object({
    id: uuid,
    nivel: z.enum(NIVEIS_ALERTA),
    mensagem: z.string(),
    ativo: z.boolean(),
    criadoEm: dataHora,
    encerradoEm: dataHora.nullable(),
    pontoRiscoId: uuid,
  })
  .openapi('Alerta');

export const RelatoSchema = z
  .object({
    id: uuid,
    descricao: z.string(),
    intensidade: z.enum(INTENSIDADES_RELATO),
    status: z.enum(STATUS_RELATO),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    criadoEm: dataHora,
    bairroId: uuid,
    pontoRiscoId: uuid.nullable(),
  })
  .openapi('Relato');

const NivelRiscoSchema = z.enum(['NORMAL', 'ATENCAO', 'CRITICO']);

export const StatusPontoSchema = z
  .object({
    ponto: PontoRiscoSchema,
    nivelAtual: z.enum(['SEM_DADOS', 'NORMAL', 'ATENCAO', 'CRITICO']),
    ultimaLeitura: LeituraSchema.nullable(),
    alertaAtivo: AlertaSchema.nullable(),
  })
  .openapi('StatusPonto');

export const ResultadoLeituraSchema = z
  .object({
    leitura: LeituraSchema,
    nivel: NivelRiscoSchema,
    acao: z.enum(['NENHUMA', 'CRIADO', 'ATUALIZADO', 'MANTIDO', 'ENCERRADO']),
    alerta: AlertaSchema.nullable(),
  })
  .openapi('ResultadoLeitura');

export const ErroSchema = z
  .object({
    erro: z.string(),
    detalhes: z.array(z.object({ campo: z.string(), mensagem: z.string() })).optional(),
  })
  .openapi('Erro');
