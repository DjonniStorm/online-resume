-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResumeSectionType" AS ENUM ('PROFILE', 'ABOUT', 'CONTACTS', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'LANGUAGES', 'PROJECTS', 'CERTIFICATES');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateLayout" AS ENUM ('SINGLE_COLUMN', 'SIDEBAR_LEFT', 'SIDEBAR_RIGHT', 'WIDE_HEADER');

-- CreateEnum
CREATE TYPE "TemplatePhotoPlacement" AS ENUM ('NONE', 'HEADER_START', 'HEADER_END', 'SIDEBAR_TOP', 'MAIN_TOP');

-- CreateEnum
CREATE TYPE "TemplatePhotoShape" AS ENUM ('CIRCLE', 'SQUARE', 'ROUNDED_RECTANGLE');

-- CreateEnum
CREATE TYPE "TemplateContinuationHeader" AS ENUM ('FULL', 'COMPACT', 'NONE');

-- CreateEnum
CREATE TYPE "TemplateRegion" AS ENUM ('PAGE', 'HEADER', 'SIDEBAR', 'MAIN', 'FOOTER');

-- CreateEnum
CREATE TYPE "TemplateSectionLayout" AS ENUM ('STANDARD', 'COMPACT', 'TIMELINE', 'TAGS', 'BARS');

-- CreateEnum
CREATE TYPE "TemplateSpacing" AS ENUM ('COMPACT', 'REGULAR', 'RELAXED');

-- CreateEnum
CREATE TYPE "TemplateImageFit" AS ENUM ('COVER', 'CONTAIN', 'FILL');

-- CreateEnum
CREATE TYPE "TemplateAssetKind" AS ENUM ('RASTER_IMAGE', 'VECTOR_IMAGE', 'FONT');

-- CreateEnum
CREATE TYPE "TemplateFieldType" AS ENUM ('FIRST_NAME', 'LAST_NAME', 'HEADLINE', 'EMAIL', 'PHONE', 'LOCATION', 'GITHUB_URL', 'TELEGRAM_HANDLE', 'WEBSITE_URL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "githubUrl" TEXT,
    "telegramHandle" TEXT,
    "websiteUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "previewUrl" TEXT,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "layout" "TemplateLayout" NOT NULL,
    "pageWidthMm" DECIMAL(8,3) NOT NULL,
    "pageHeightMm" DECIMAL(8,3) NOT NULL,
    "sidebarWidthPercent" INTEGER,
    "photoPlacement" "TemplatePhotoPlacement" NOT NULL DEFAULT 'NONE',
    "photoShape" "TemplatePhotoShape" NOT NULL DEFAULT 'CIRCLE',
    "continuationHeader" "TemplateContinuationHeader" NOT NULL DEFAULT 'COMPACT',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "publishedAt" TIMESTAMPTZ(3),
    "archivedAt" TIMESTAMPTZ(3),

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateTheme" (
    "templateId" TEXT NOT NULL,
    "titleFontFamily" TEXT NOT NULL,
    "bodyFontFamily" TEXT NOT NULL,
    "titleFontAssetId" TEXT,
    "bodyFontAssetId" TEXT,
    "titleSizePt" DECIMAL(6,2) NOT NULL,
    "sectionTitleSizePt" DECIMAL(6,2) NOT NULL,
    "bodySizePt" DECIMAL(6,2) NOT NULL,
    "lineHeight" DECIMAL(4,2) NOT NULL DEFAULT 1.2,
    "spacing" "TemplateSpacing" NOT NULL DEFAULT 'REGULAR',
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "pageColor" TEXT NOT NULL,
    "headerColor" TEXT,
    "sidebarColor" TEXT,

    CONSTRAINT "TemplateTheme_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "TemplateSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" "ResumeSectionType" NOT NULL,
    "region" "TemplateRegion" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "itemLayout" "TemplateSectionLayout" NOT NULL DEFAULT 'STANDARD',
    "canReorder" BOOLEAN NOT NULL DEFAULT true,
    "showHeading" BOOLEAN NOT NULL DEFAULT true,
    "headingText" TEXT,
    "accentColor" TEXT,

    CONSTRAINT "TemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateFieldRule" (
    "templateId" TEXT NOT NULL,
    "field" "TemplateFieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplateFieldRule_pkey" PRIMARY KEY ("templateId","field")
);

-- CreateTable
CREATE TABLE "TemplateDecoration" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "region" "TemplateRegion" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "fit" "TemplateImageFit" NOT NULL DEFAULT 'COVER',
    "opacity" DECIMAL(4,3) NOT NULL DEFAULT 1,
    "repeatOnContinuation" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TemplateDecoration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "kind" "TemplateAssetKind" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "headline" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "githubUrl" TEXT,
    "telegramHandle" TEXT,
    "websiteUrl" TEXT,
    "about" TEXT,
    "photoPath" TEXT,
    "publicSlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSection" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "type" "ResumeSectionType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeExperience" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "location" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeLanguage" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProject" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "url" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeCertificate" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issuedAt" DATE,
    "expiresAt" DATE,
    "credentialUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ResumeCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeView" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "viewedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeTemplate_slug_key" ON "ResumeTemplate"("slug");

-- CreateIndex
CREATE INDEX "ResumeTemplate_status_idx" ON "ResumeTemplate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSection_templateId_type_key" ON "TemplateSection"("templateId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSection_templateId_region_sortOrder_key" ON "TemplateSection"("templateId", "region", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateDecoration_templateId_region_sortOrder_key" ON "TemplateDecoration"("templateId", "region", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAsset_storageKey_key" ON "TemplateAsset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_publicSlug_key" ON "Resume"("publicSlug");

-- CreateIndex
CREATE INDEX "Resume_ownerId_updatedAt_idx" ON "Resume"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Resume_templateId_idx" ON "Resume"("templateId");

-- CreateIndex
CREATE INDEX "Resume_isPublished_publicSlug_idx" ON "Resume"("isPublished", "publicSlug");

-- CreateIndex
CREATE INDEX "ResumeSection_resumeId_sortOrder_idx" ON "ResumeSection"("resumeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSection_resumeId_type_key" ON "ResumeSection"("resumeId", "type");

-- CreateIndex
CREATE INDEX "ResumeExperience_resumeId_sortOrder_idx" ON "ResumeExperience"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeEducation_resumeId_sortOrder_idx" ON "ResumeEducation"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeSkill_resumeId_sortOrder_idx" ON "ResumeSkill"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeLanguage_resumeId_sortOrder_idx" ON "ResumeLanguage"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeProject_resumeId_sortOrder_idx" ON "ResumeProject"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeCertificate_resumeId_sortOrder_idx" ON "ResumeCertificate"("resumeId", "sortOrder");

-- CreateIndex
CREATE INDEX "ResumeView_resumeId_viewedAt_idx" ON "ResumeView"("resumeId", "viewedAt");

-- CreateIndex
CREATE INDEX "ResumeView_resumeId_visitorKey_viewedAt_idx" ON "ResumeView"("resumeId", "visitorKey", "viewedAt");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTheme" ADD CONSTRAINT "TemplateTheme_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTheme" ADD CONSTRAINT "TemplateTheme_titleFontAssetId_fkey" FOREIGN KEY ("titleFontAssetId") REFERENCES "TemplateAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTheme" ADD CONSTRAINT "TemplateTheme_bodyFontAssetId_fkey" FOREIGN KEY ("bodyFontAssetId") REFERENCES "TemplateAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSection" ADD CONSTRAINT "TemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFieldRule" ADD CONSTRAINT "TemplateFieldRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDecoration" ADD CONSTRAINT "TemplateDecoration_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDecoration" ADD CONSTRAINT "TemplateDecoration_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "TemplateAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLanguage" ADD CONSTRAINT "ResumeLanguage_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCertificate" ADD CONSTRAINT "ResumeCertificate_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeView" ADD CONSTRAINT "ResumeView_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
