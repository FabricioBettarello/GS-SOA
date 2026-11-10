import { Bairro, NovoBairro } from '../domain/entities';
import { ConflictError, NotFoundError } from '../domain/errors';
import { BairroRepository } from '../domain/repositories';

export class BairroService {
  constructor(private readonly bairros: BairroRepository) {}

  async criar(dados: NovoBairro): Promise<Bairro> {
    const existente = await this.bairros.findByNome(dados.nome);
    if (existente) throw new ConflictError(`O bairro "${dados.nome}" já está cadastrado.`);
    return this.bairros.create(dados);
  }

  listar(): Promise<Bairro[]> {
    return this.bairros.findAll();
  }

  async buscar(id: string): Promise<Bairro> {
    const bairro = await this.bairros.findById(id);
    if (!bairro) throw new NotFoundError('Bairro', id);
    return bairro;
  }
}
