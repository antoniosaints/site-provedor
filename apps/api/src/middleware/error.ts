import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export const notFoundHandler = () => {
  throw new HttpError(404, 'Rota não encontrada.');
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(422).json({
      message: 'Dados inválidos.',
      errors: error.flatten()
    });
    return;
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : 'Erro interno do servidor.';

  res.status(statusCode).json({
    message,
    ...(error instanceof HttpError && error.details ? { errors: error.details } : {}),
    ...(env.NODE_ENV !== 'production' && !(error instanceof HttpError) ? { stack: error.stack } : {})
  });
};
