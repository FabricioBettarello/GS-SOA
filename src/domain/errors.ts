export class DomainError extends Error {
  readonly statusCode: number = 422;
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  override readonly statusCode = 404;
  constructor(recurso: string, id: string) {
    super(`${recurso} não encontrado(a): ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  override readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
