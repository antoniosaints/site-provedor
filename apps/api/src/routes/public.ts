import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
}

type PlanComplementView = {
  id: string;
  name: string;
  category: string;
  logoUrl?: string | null;
  sortOrder: number;
};

function normalizePlan<T extends { benefits?: unknown; complementIds?: unknown }>(plan: T, complementsById = new Map<string, PlanComplementView>()) {
  const complementIds = parseList(plan.complementIds);
  const complements = complementIds
    .map((id) => complementsById.get(id))
    .filter((item): item is PlanComplementView => Boolean(item));

  return { ...plan, benefits: parseList(plan.benefits), complementIds, complements };
}

function normalizeBanner<T extends { highlights?: unknown }>(banner: T) {
  return { ...banner, highlights: parseList(banner.highlights) };
}

function normalizeSettings<T extends { carouselFeatureBandItems?: unknown } | null>(settings: T) {
  return settings ? { ...settings, carouselFeatureBandItems: parseList(settings.carouselFeatureBandItems) } : settings;
}

function normalizeCompany<T extends { differentials?: unknown } | null>(company: T) {
  return company ? { ...company, differentials: parseList(company.differentials) } : company;
}

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  subject: z.string().optional(),
  message: z.string().min(5),
  requestType: z.string().default('comercial')
});

const coverageSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(4),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  reference: z.string().optional(),
  planInterest: z.string().optional()
});

router.get('/home', asyncHandler(async (_req, res) => {
  const [settings, company, missionVisionValues, banners, plans, planComplements, featureHighlights, testimonials, posts, socialLinks] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'main' } }),
    prisma.companyInfo.findUnique({ where: { id: 'main' } }),
    prisma.missionVisionValues.findUnique({ where: { id: 'main' } }),
    prisma.banner.findMany({ where: { active: true, location: 'home' }, orderBy: { sortOrder: 'asc' } }),
    prisma.internetPlan.findMany({
      where: { active: true, showOnHome: true },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      take: 4
    }),
    prisma.planComplement.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.featureHighlight.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.testimonial.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
    prisma.blogPost.findMany({
      where: { status: 'published' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 3
    }),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  ]);
  const complementsById = new Map<string, PlanComplementView>(planComplements.map((item) => [item.id, {
    id: item.id,
    name: item.name,
    category: item.category,
    logoUrl: item.logoUrl,
    sortOrder: item.sortOrder
  }]));

  res.json({
    settings: normalizeSettings(settings),
    company: normalizeCompany(company),
    missionVisionValues,
    banners: banners.map(normalizeBanner),
    plans: plans.map((plan) => normalizePlan(plan, complementsById)),
    featureHighlights,
    testimonials,
    posts,
    socialLinks
  });
}));

router.get('/plans', asyncHandler(async (req, res) => {
  const sort = String(req.query.sort ?? 'featured');
  const type = req.query.type ? String(req.query.type) : undefined;
  const orderBy =
    sort === 'price' ? [{ priceCents: 'asc' as const }] :
    sort === 'speed' ? [{ downloadMbps: 'desc' as const }] :
    [{ featured: 'desc' as const }, { sortOrder: 'asc' as const }];

  const [plans, planComplements] = await Promise.all([
    prisma.internetPlan.findMany({
      where: { active: true, ...(type ? { type: type as never } : {}) },
      orderBy
    }),
    prisma.planComplement.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  ]);
  const complementsById = new Map<string, PlanComplementView>(planComplements.map((item) => [item.id, {
    id: item.id,
    name: item.name,
    category: item.category,
    logoUrl: item.logoUrl,
    sortOrder: item.sortOrder
  }]));
  res.json({ data: plans.map((plan) => normalizePlan(plan, complementsById)) });
}));

router.get('/blog/posts', asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const take = Number(req.query.take ?? 9);
  const [data, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'published' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * take,
      take
    }),
    prisma.blogPost.count({ where: { status: 'published' } })
  ]);
  res.json({ data, total, page, take });
}));

router.get('/blog/posts/:slug', asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug: String(req.params.slug), status: 'published' },
    include: { category: true }
  });
  if (!post) throw new HttpError(404, 'Post não encontrado.');
  res.json({ data: post });
}));

router.get('/company', asyncHandler(async (_req, res) => {
  const [company, missionVisionValues, socialLinks] = await Promise.all([
    prisma.companyInfo.findUnique({ where: { id: 'main' } }),
    prisma.missionVisionValues.findUnique({ where: { id: 'main' } }),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  ]);
  res.json({ company: normalizeCompany(company), missionVisionValues, socialLinks });
}));

router.get('/settings', asyncHandler(async (_req, res) => {
  const [settings, company, socialLinks] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'main' } }),
    prisma.companyInfo.findUnique({ where: { id: 'main' } }),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  ]);
  res.json({ settings: normalizeSettings(settings), company: normalizeCompany(company), socialLinks });
}));

router.post('/contact', asyncHandler(async (req, res) => {
  const data = contactSchema.parse(req.body);
  const message = await prisma.contactMessage.create({
    data: { ...data, email: data.email || undefined }
  });
  res.status(201).json({ data: message });
}));

router.post('/coverage', asyncHandler(async (req, res) => {
  const data = coverageSchema.parse(req.body);
  const request = await prisma.coverageRequest.create({ data });
  res.status(201).json({ data: request });
}));

export default router;
