import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function tableExists(name: string) {
  const result = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    name
  );
  return result.length > 0;
}

async function columnExists(table: string, column: string) {
  const result = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("${table}")`);
  return result.some((item) => item.name === column);
}

function parseLegacyList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
}

async function ensureFeatureHighlightTable() {
  if (!(await tableExists('FeatureHighlight'))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "FeatureHighlight" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT 'Gauge',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);
    console.log('Created FeatureHighlight table.');
  }
}

async function ensurePlanComplementTable() {
  if (!(await tableExists('PlanComplement'))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "PlanComplement" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'app',
        "logoUrl" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);
    console.log('Created PlanComplement table.');
  }
}

async function seedFeatureHighlightsFromSettings() {
  const count = await prisma.featureHighlight.count();
  if (count > 0) return;

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  const legacyItems = parseLegacyList(settings?.carouselFeatureBandItems);
  const titles = legacyItems.length ? legacyItems : ['Mega Fibra', 'Suporte Total', 'Ponto Gamer'];
  const icons = ['Gauge', 'ShieldCheck', 'Gamepad2', 'Wifi', 'Router', 'Building2', 'Rocket'];

  await prisma.featureHighlight.createMany({
    data: titles.map((title, index) => ({
      title,
      icon: icons[index % icons.length],
      sortOrder: index + 1
    }))
  });
  console.log('Seeded FeatureHighlight from existing settings.');
}

async function main() {
  if (await tableExists('User')) {
    if (!(await columnExists('SiteSettings', 'animationsEnabled'))) {
      await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN "animationsEnabled" BOOLEAN NOT NULL DEFAULT true');
      console.log('Added SiteSettings.animationsEnabled.');
    }
    if (!(await columnExists('Banner', 'highlights'))) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Banner" ADD COLUMN "highlights" TEXT NOT NULL DEFAULT \'[]\'');
      console.log('Added Banner.highlights.');
    }
    if (!(await columnExists('Banner', 'carouselType'))) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Banner" ADD COLUMN "carouselType" TEXT NOT NULL DEFAULT \'content\'');
      console.log('Added Banner.carouselType.');
    }
    if (!(await columnExists('InternetPlan', 'complementIds'))) {
      await prisma.$executeRawUnsafe('ALTER TABLE "InternetPlan" ADD COLUMN "complementIds" TEXT NOT NULL DEFAULT \'[]\'');
      console.log('Added InternetPlan.complementIds.');
    }
    const siteSettingColumns = [
      ['headerBackgroundColor', "'#ffffff'"],
      ['headerTextColor', "'#102133'"],
      ['footerBackgroundColor', "'#ffffff'"],
      ['footerTextColor', "'#102133'"],
      ['adminSidebarTitle', "'MEGANET'"],
      ['carouselFeatureBandItems', "'[\"Mega Fibra\",\"Suporte Total\",\"Ponto Gamer\",\"Wi-Fi 6\",\"Wi-Fi Plus\",\"Empresas\",\"Super Upload\"]'"]
    ] as const;

    for (const [column, defaultValue] of siteSettingColumns) {
      if (!(await columnExists('SiteSettings', column))) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "SiteSettings" ADD COLUMN "${column}" TEXT NOT NULL DEFAULT ${defaultValue}`);
        console.log(`Added SiteSettings.${column}.`);
      }
    }
    for (const column of ['subscriberCenterUrl', 'careersUrl'] as const) {
      if (!(await columnExists('SiteSettings', column))) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "SiteSettings" ADD COLUMN "${column}" TEXT`);
        console.log(`Added SiteSettings.${column}.`);
      }
    }
    await ensureFeatureHighlightTable();
    await ensurePlanComplementTable();
    await seedFeatureHighlightsFromSettings();
    console.log('Database already has the initial schema. Skipping migration.');
    return;
  }

  const migrationPath = path.resolve('prisma/migrations/20260516011800_init/migration.sql');
  const sql = await readFile(migrationPath, 'utf8');
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log('Initial SQLite schema applied.');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
