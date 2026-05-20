import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http-error.js';

type JwtPayload = {
  sub: string;
  email: string;
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function signAdminToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as never
  });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.admin_token;
    if (!token) throw new HttpError(401, 'Login necessário.');

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) throw new HttpError(401, 'Sessão inválida.');
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Sessão inválida.'));
  }
}

export function requireRoles(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user || !roles.includes(user.role)) {
      next(new HttpError(403, 'Você não tem permissão para acessar esta área.'));
      return;
    }
    next();
  };
}
