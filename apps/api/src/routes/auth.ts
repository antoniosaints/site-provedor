import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { requireAuth, signAdminToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const token = signAdminToken(user);
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: (req as typeof req & { user: unknown }).user });
});

export default router;
