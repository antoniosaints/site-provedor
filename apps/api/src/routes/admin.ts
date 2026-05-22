import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { uploadImage, uploadPngImage } from '../middleware/upload.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { uniqueSlug } from '../utils/slug.js';

const router = Router();
router.use(requireAuth);

const adminOnly = requireRoles(['admin']);
const managerOnly = requireRoles(['admin', 'gerente']);
const atendimentoOnly = requireRoles(['admin', 'gerente', 'atendente']);
const roles = ['admin', 'gerente', 'atendente'] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  take: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional()
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(roles).default('atendente')
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(roles).optional()
});

const coverageMapSchema = z.object({
  coverageMapEnabled: z.boolean()
});

const delegates = {
  banners: prisma.banner,
  plans: prisma.internetPlan,
  featureHighlights: prisma.featureHighlight,
  planComplements: prisma.planComplement,
  coverageLocations: prisma.coverageLocation,
  categories: prisma.blogCategory,
  posts: prisma.blogPost,
  testimonials: prisma.testimonial,
  socialLinks: prisma.socialLink
} as const;

type DelegateName = keyof typeof delegates;

function getDelegate(name: DelegateName) {
  return delegates[name] as any;
}

async function listCrud(req: any, res: any, name: DelegateName, searchFields: string[] = ['name', 'title']) {
  const query = listQuerySchema.parse(req.query);
  const where = query.search
    ? { OR: searchFields.map((field) => ({ [field]: { contains: query.search } })) }
    : {};
  const delegate = getDelegate(name);
  const orderBy = ['banners', 'plans', 'featureHighlights', 'planComplements', 'coverageLocations', 'testimonials', 'socialLinks'].includes(name)
    ? { sortOrder: 'asc' }
    : { createdAt: 'desc' };
  const [data, total] = await Promise.all([
    delegate.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.take,
      take: query.take
    }),
    delegate.count({ where })
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}

async function preparePayload(model: DelegateName, body: any, id?: string) {
  const payload = { ...body };
  if (Array.isArray(payload.benefits)) payload.benefits = JSON.stringify(payload.benefits);
  if (Array.isArray(payload.differentials)) payload.differentials = JSON.stringify(payload.differentials);
  if (Array.isArray(payload.highlights)) payload.highlights = JSON.stringify(payload.highlights);
  if (Array.isArray(payload.carouselFeatureBandItems)) payload.carouselFeatureBandItems = JSON.stringify(payload.carouselFeatureBandItems);
  if (Array.isArray(payload.complementIds)) payload.complementIds = JSON.stringify(payload.complementIds);
  if (model === 'banners' && !payload.carouselType) payload.carouselType = 'content';
  if (model === 'featureHighlights' && !payload.icon) payload.icon = 'Gauge';
  if (model === 'planComplements' && !payload.category) payload.category = 'app';
  if (model === 'coverageLocations') {
    payload.latitude = Number(payload.latitude);
    payload.longitude = Number(payload.longitude);
    payload.markerIconUrl = String(payload.markerIconUrl ?? '').trim() || null;
  }
  if (model === 'socialLinks') {
    payload.iconUrl = String(payload.iconUrl ?? '').trim() || null;
  }
  if (payload.price !== undefined && payload.priceCents === undefined) {
    payload.priceCents = Math.round(Number(payload.price) * 100);
    delete payload.price;
  }
  if (model === 'categories') {
    const source = payload.slug || payload.name;
    payload.slug = await uniqueSlug(source, async (slug) => {
      const existing = await prisma.blogCategory.findUnique({ where: { slug } });
      return Boolean(existing && existing.id !== id);
    }, payload.slug);
  }
  if (model === 'posts') {
    const source = payload.slug || payload.title;
    payload.slug = await uniqueSlug(source, async (slug) => {
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      return Boolean(existing && existing.id !== id);
    }, payload.slug);
    if (payload.status === 'published' && !payload.publishedAt) payload.publishedAt = new Date();
  }
  return payload;
}

function buildMonthRanges(length = 6) {
  const today = new Date();
  return Array.from({ length }, (_, index) => {
    const start = new Date(today.getFullYear(), today.getMonth() - (length - 1 - index), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const label = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    return {
      key: `${start.getFullYear()}-${month}`,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      start,
      end
    };
  });
}

async function countMonthly(delegate: { count: (args: any) => Promise<number> }, ranges: ReturnType<typeof buildMonthRanges>) {
  return Promise.all(ranges.map(async (range) => ({
    key: range.key,
    label: range.label,
    total: await delegate.count({ where: { createdAt: { gte: range.start, lt: range.end } } })
  })));
}

router.get('/dashboard', atendimentoOnly, asyncHandler(async (_req, res) => {
  const ranges = buildMonthRanges();
  const [
    plans,
    activePlans,
    posts,
    totalPosts,
    banners,
    contacts,
    coverage,
    testimonials,
    totalTestimonials,
    monthlyContacts,
    monthlyCoverage
  ] = await Promise.all([
    prisma.internetPlan.count(),
    prisma.internetPlan.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { status: 'published' } }),
    prisma.blogPost.count(),
    prisma.banner.count({ where: { active: true } }),
    prisma.contactMessage.count({ where: { status: 'novo' } }),
    prisma.coverageRequest.count({ where: { status: 'novo' } }),
    prisma.testimonial.count({ where: { active: true } }),
    prisma.testimonial.count(),
    countMonthly(prisma.contactMessage, ranges),
    countMonthly(prisma.coverageRequest, ranges)
  ]);
  res.json({
    plans,
    posts,
    banners,
    contacts,
    coverage,
    testimonials,
    content: {
      plans: { total: plans, active: activePlans },
      posts: { total: totalPosts, published: posts },
      testimonials: { total: totalTestimonials, active: testimonials }
    },
    monthly: {
      contacts: monthlyContacts,
      coverage: monthlyCoverage
    }
  });
}));

router.post('/uploads/image', managerOnly, uploadImage.single('image'), (req, res) => {
  if (!req.file) throw new HttpError(422, 'Imagem obrigatória.');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.post('/uploads/png', managerOnly, uploadPngImage.single('image'), (req, res) => {
  if (!req.file) throw new HttpError(422, 'PNG obrigatorio.');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.get('/banners', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'banners', ['title', 'subtitle'])));
router.get('/plans', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'plans', ['name', 'description'])));
router.get('/highlights', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'featureHighlights', ['title', 'icon'])));
router.get('/plan-complements', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'planComplements', ['name', 'category'])));
router.get('/coverage-locations', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'coverageLocations', ['name', 'address'])));
router.get('/blog/categories', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'categories', ['name', 'description'])));
router.get('/blog/posts', managerOnly, asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = query.search ? { title: { contains: query.search } } : {};
  const [data, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      skip: (query.page - 1) * query.take,
      take: query.take
    }),
    prisma.blogPost.count({ where })
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));
router.get('/testimonials', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'testimonials', ['name', 'text'])));
router.get('/social-links', managerOnly, asyncHandler((req, res) => listCrud(req, res, 'socialLinks', ['name', 'url'])));

router.get('/users', adminOnly, asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = query.search
    ? { OR: [{ name: { contains: query.search } }, { email: { contains: query.search } }] }
    : {};
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.take,
      take: query.take,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    }),
    prisma.user.count({ where })
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));

router.get('/users/:id', adminOnly, asyncHandler(async (req, res) => {
  const data = await prisma.user.findUnique({
    where: { id: String(req.params.id) },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  if (!data) throw new HttpError(404, 'Usuário não encontrado.');
  res.json({ data });
}));

router.post('/users', adminOnly, asyncHandler(async (req, res) => {
  const payload = createUserSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const data = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      passwordHash
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  res.status(201).json({ data });
}));

router.put('/users/:id', adminOnly, asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const current = await prisma.user.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, 'Usuário não encontrado.');

  const payload = updateUserSchema.parse(req.body);
  if (current.role === 'admin' && payload.role && payload.role !== 'admin') {
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    if (admins <= 1) throw new HttpError(422, 'Mantenha pelo menos um usuário administrador.');
  }

  const dataPayload: Record<string, unknown> = {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    ...(payload.role ? { role: payload.role } : {})
  };
  if (payload.password) dataPayload.passwordHash = await bcrypt.hash(payload.password, 12);

  const data = await prisma.user.update({
    where: { id },
    data: dataPayload,
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  res.json({ data });
}));

router.delete('/users/:id', adminOnly, asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const currentUser = (req as typeof req & { user?: { id: string } }).user;
  if (currentUser?.id === id) throw new HttpError(422, 'Você não pode excluir seu próprio usuário.');

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, 'Usuário não encontrado.');
  if (target.role === 'admin') {
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    if (admins <= 1) throw new HttpError(422, 'Mantenha pelo menos um usuário administrador.');
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}));

const crudMap: Record<string, DelegateName> = {
  banners: 'banners',
  plans: 'plans',
  highlights: 'featureHighlights',
  'plan-complements': 'planComplements',
  'coverage-locations': 'coverageLocations',
  'blog/categories': 'categories',
  'blog/posts': 'posts',
  testimonials: 'testimonials',
  'social-links': 'socialLinks'
};

for (const [path, model] of Object.entries(crudMap)) {
  router.get(`/${path}/:id`, managerOnly, asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const data = await getDelegate(model).findUnique({ where: { id } });
    if (!data) throw new HttpError(404, 'Registro não encontrado.');
    res.json({ data });
  }));

  router.post(`/${path}`, managerOnly, asyncHandler(async (req, res) => {
    const data = await getDelegate(model).create({ data: await preparePayload(model, req.body) });
    res.status(201).json({ data });
  }));

  router.put(`/${path}/:id`, managerOnly, asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const data = await getDelegate(model).update({
      where: { id },
      data: await preparePayload(model, req.body, id)
    });
    res.json({ data });
  }));

  router.delete(`/${path}/:id`, managerOnly, asyncHandler(async (req, res) => {
    await getDelegate(model).delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }));
}

router.get('/coverage-map', managerOnly, asyncHandler(async (_req, res) => {
  const settings = await prisma.siteSettings.upsert({ where: { id: 'main' }, update: {}, create: {} });
  res.json({ data: { coverageMapEnabled: settings.coverageMapEnabled } });
}));

router.put('/coverage-map', managerOnly, asyncHandler(async (req, res) => {
  const payload = coverageMapSchema.parse(req.body);
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: payload,
    create: { ...payload, id: 'main' }
  });
  res.json({ data: { coverageMapEnabled: settings.coverageMapEnabled } });
}));

router.get('/settings', adminOnly, asyncHandler(async (_req, res) => {
  const data = await prisma.siteSettings.upsert({ where: { id: 'main' }, update: {}, create: {} });
  res.json({ data });
}));

router.put('/settings', adminOnly, asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (Array.isArray(payload.carouselFeatureBandItems)) payload.carouselFeatureBandItems = JSON.stringify(payload.carouselFeatureBandItems);
  if (payload.whatsappFloatIconUrl !== undefined) {
    const whatsappFloatIconUrl = String(payload.whatsappFloatIconUrl ?? '').trim();
    if (whatsappFloatIconUrl && !whatsappFloatIconUrl.toLowerCase().split('?')[0].endsWith('.png')) {
      throw new HttpError(422, 'O icone do botao flutuante deve ser um PNG.');
    }
    payload.whatsappFloatIconUrl = whatsappFloatIconUrl || null;
  }
  const data = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: payload,
    create: { ...payload, id: 'main' }
  });
  res.json({ data });
}));

router.get('/company', managerOnly, asyncHandler(async (_req, res) => {
  const data = await prisma.companyInfo.findUnique({ where: { id: 'main' } });
  res.json({ data });
}));

router.put('/company', managerOnly, asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (Array.isArray(payload.differentials)) payload.differentials = JSON.stringify(payload.differentials);
  const data = await prisma.companyInfo.upsert({
    where: { id: 'main' },
    update: payload,
    create: { ...payload, id: 'main' }
  });
  res.json({ data });
}));

router.get('/mission-vision-values', managerOnly, asyncHandler(async (_req, res) => {
  const data = await prisma.missionVisionValues.findUnique({ where: { id: 'main' } });
  res.json({ data });
}));

router.put('/mission-vision-values', managerOnly, asyncHandler(async (req, res) => {
  const data = await prisma.missionVisionValues.upsert({
    where: { id: 'main' },
    update: req.body,
    create: { ...req.body, id: 'main' }
  });
  res.json({ data });
}));

router.get('/contact-messages', atendimentoOnly, asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const [data, total] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.take, take: query.take }),
    prisma.contactMessage.count()
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));

router.patch('/contact-messages/:id', atendimentoOnly, asyncHandler(async (req, res) => {
  const data = await prisma.contactMessage.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json({ data });
}));

router.delete('/contact-messages/:id', atendimentoOnly, asyncHandler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}));

router.get('/coverage-requests', atendimentoOnly, asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const [data, total] = await Promise.all([
    prisma.coverageRequest.findMany({ orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.take, take: query.take }),
    prisma.coverageRequest.count()
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));

router.patch('/coverage-requests/:id', atendimentoOnly, asyncHandler(async (req, res) => {
  const data = await prisma.coverageRequest.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json({ data });
}));

router.delete('/coverage-requests/:id', atendimentoOnly, asyncHandler(async (req, res) => {
  await prisma.coverageRequest.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}));

export default router;
