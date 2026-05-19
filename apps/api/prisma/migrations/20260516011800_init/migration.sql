-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "imageUrl" TEXT,
    "carouselType" TEXT NOT NULL DEFAULT 'content',
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "location" TEXT NOT NULL DEFAULT 'home',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InternetPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "downloadMbps" INTEGER NOT NULL,
    "uploadMbps" INTEGER,
    "priceCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'residencial',
    "description" TEXT,
    "benefits" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "complementIds" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "legalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FeatureHighlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Gauge',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlanComplement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'app',
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "author" TEXT NOT NULL DEFAULT 'MEGANET',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" DATETIME,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "location" TEXT,
    "avatarUrl" TEXT,
    "rating" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "requestType" TEXT NOT NULL DEFAULT 'comercial',
    "status" TEXT NOT NULL DEFAULT 'novo',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoverageRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "reference" TEXT,
    "planInterest" TEXT,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "siteTitle" TEXT NOT NULL DEFAULT 'MEGANET',
    "seoDescription" TEXT NOT NULL DEFAULT 'Internet fibra óptica rápida, estável e com atendimento próximo.',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0877c8',
    "secondaryColor" TEXT NOT NULL DEFAULT '#20c7a5',
    "headerBackgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "headerTextColor" TEXT NOT NULL DEFAULT '#102133',
    "footerBackgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "footerTextColor" TEXT NOT NULL DEFAULT '#102133',
    "carouselFeatureBandItems" TEXT NOT NULL DEFAULT '["Mega Fibra","Suporte Total","Ponto Gamer","Wi-Fi 6","Wi-Fi Plus","Empresas","Super Upload"]',
    "ctaPlansText" TEXT NOT NULL DEFAULT 'Ver planos',
    "ctaWhatsappText" TEXT NOT NULL DEFAULT 'Falar no WhatsApp',
    "whatsappContractMessage" TEXT NOT NULL DEFAULT 'Olá! Quero contratar um plano da MEGANET.',
    "whatsappSupportMessage" TEXT NOT NULL DEFAULT 'Olá! Preciso de suporte da MEGANET.',
    "whatsappCoverageMessage" TEXT NOT NULL DEFAULT 'Olá! Quero consultar cobertura da MEGANET.',
    "animationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "externalScripts" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "companyName" TEXT NOT NULL DEFAULT 'MEGANET',
    "shortDescription" TEXT NOT NULL DEFAULT 'Internet de alta performance com atendimento próximo e estrutura profissional.',
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "businessHours" TEXT,
    "mapsEmbedUrl" TEXT,
    "cnpj" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Internet confiável para conectar sua rotina',
    "aboutText" TEXT NOT NULL,
    "history" TEXT,
    "differentials" TEXT NOT NULL DEFAULT '[]',
    "institutionalImageUrl" TEXT,
    "yearsInBusiness" INTEGER,
    "customerCount" INTEGER,
    "citiesServed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MissionVisionValues" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "complement" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
