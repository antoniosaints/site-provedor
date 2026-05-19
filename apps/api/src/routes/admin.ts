import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { uniqueSlug } from '../utils/slug.js';

const router = Router();
router.use(requireAuth);

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  take: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional()
});

const delegates = {
  banners: prisma.banner,
  plans: prisma.internetPlan,
  featureHighlights: prisma.featureHighlight,
  planComplements: prisma.planComplement,
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
  const orderBy = ['banners', 'plans', 'featureHighlights', 'planComplements', 'testimonials', 'socialLinks'].includes(name)
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

router.get('/dashboard', asyncHandler(async (_req, res) => {
  const [plans, posts, banners, contacts, coverage, testimonials] = await Promise.all([
    prisma.internetPlan.count(),
    prisma.blogPost.count({ where: { status: 'published' } }),
    prisma.banner.count({ where: { active: true } }),
    prisma.contactMessage.count({ where: { status: 'novo' } }),
    prisma.coverageRequest.count({ where: { status: 'novo' } }),
    prisma.testimonial.count({ where: { active: true } })
  ]);
  res.json({ plans, posts, banners, contacts, coverage, testimonials });
}));

router.post('/uploads/image', uploadImage.single('image'), (req, res) => {
  if (!req.file) throw new HttpError(422, 'Imagem obrigatória.');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.get('/banners', asyncHandler((req, res) => listCrud(req, res, 'banners', ['title', 'subtitle'])));
router.get('/plans', asyncHandler((req, res) => listCrud(req, res, 'plans', ['name', 'description'])));
router.get('/highlights', asyncHandler((req, res) => listCrud(req, res, 'featureHighlights', ['title', 'icon'])));
router.get('/plan-complements', asyncHandler((req, res) => listCrud(req, res, 'planComplements', ['name', 'category'])));
router.get('/blog/categories', asyncHandler((req, res) => listCrud(req, res, 'categories', ['name', 'description'])));
router.get('/blog/posts', asyncHandler(async (req, res) => {
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
router.get('/testimonials', asyncHandler((req, res) => listCrud(req, res, 'testimonials', ['name', 'text'])));
router.get('/social-links', asyncHandler((req, res) => listCrud(req, res, 'socialLinks', ['name', 'url'])));

const crudMap: Record<string, DelegateName> = {
  banners: 'banners',
  plans: 'plans',
  highlights: 'featureHighlights',
  'plan-complements': 'planComplements',
  'blog/categories': 'categories',
  'blog/posts': 'posts',
  testimonials: 'testimonials',
  'social-links': 'socialLinks'
};

for (const [path, model] of Object.entries(crudMap)) {
  router.get(`/${path}/:id`, asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const data = await getDelegate(model).findUnique({ where: { id } });
    if (!data) throw new HttpError(404, 'Registro não encontrado.');
    res.json({ data });
  }));

  router.post(`/${path}`, asyncHandler(async (req, res) => {
    const data = await getDelegate(model).create({ data: await preparePayload(model, req.body) });
    res.status(201).json({ data });
  }));

  router.put(`/${path}/:id`, asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const data = await getDelegate(model).update({
      where: { id },
      data: await preparePayload(model, req.body, id)
    });
    res.json({ data });
  }));

  router.delete(`/${path}/:id`, asyncHandler(async (req, res) => {
    await getDelegate(model).delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  }));
}

router.get('/settings', asyncHandler(async (_req, res) => {
  const data = await prisma.siteSettings.upsert({ where: { id: 'main' }, update: {}, create: {} });
  res.json({ data });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (Array.isArray(payload.carouselFeatureBandItems)) payload.carouselFeatureBandItems = JSON.stringify(payload.carouselFeatureBandItems);
  const data = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: payload,
    create: { ...payload, id: 'main' }
  });
  res.json({ data });
}));

router.get('/company', asyncHandler(async (_req, res) => {
  const data = await prisma.companyInfo.findUnique({ where: { id: 'main' } });
  res.json({ data });
}));

router.put('/company', asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (Array.isArray(payload.differentials)) payload.differentials = JSON.stringify(payload.differentials);
  const data = await prisma.companyInfo.upsert({
    where: { id: 'main' },
    update: payload,
    create: { ...payload, id: 'main' }
  });
  res.json({ data });
}));

router.get('/mission-vision-values', asyncHandler(async (_req, res) => {
  const data = await prisma.missionVisionValues.findUnique({ where: { id: 'main' } });
  res.json({ data });
}));

router.put('/mission-vision-values', asyncHandler(async (req, res) => {
  const data = await prisma.missionVisionValues.upsert({
    where: { id: 'main' },
    update: req.body,
    create: { ...req.body, id: 'main' }
  });
  res.json({ data });
}));

router.get('/contact-messages', asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const [data, total] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.take, take: query.take }),
    prisma.contactMessage.count()
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));

router.patch('/contact-messages/:id', asyncHandler(async (req, res) => {
  const data = await prisma.contactMessage.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json({ data });
}));

router.delete('/contact-messages/:id', asyncHandler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}));

router.get('/coverage-requests', asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const [data, total] = await Promise.all([
    prisma.coverageRequest.findMany({ orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.take, take: query.take }),
    prisma.coverageRequest.count()
  ]);
  res.json({ data, total, page: query.page, take: query.take });
}));

router.patch('/coverage-requests/:id', asyncHandler(async (req, res) => {
  const data = await prisma.coverageRequest.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json({ data });
}));

router.delete('/coverage-requests/:id', asyncHandler(async (req, res) => {
  await prisma.coverageRequest.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}));

export default router;
