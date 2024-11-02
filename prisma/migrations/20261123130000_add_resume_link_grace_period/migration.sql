ALTER TABLE "Resume" ADD COLUMN "unpublishAt" TIMESTAMPTZ(3);
ALTER TABLE "ResumeDeletion" ADD COLUMN "scheduledFor" TIMESTAMPTZ(3);

CREATE INDEX "Resume_unpublishAt_idx" ON "Resume"("unpublishAt");
CREATE INDEX "ResumeDeletion_scheduledFor_idx" ON "ResumeDeletion"("scheduledFor");
