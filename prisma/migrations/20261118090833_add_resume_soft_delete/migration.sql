-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "deletedAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "Resume_ownerId_deletedAt_updatedAt_idx" ON "Resume"("ownerId", "deletedAt", "updatedAt");
