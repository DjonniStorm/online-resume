CREATE TABLE "ResumeDeletion" (
    "resumeId" TEXT NOT NULL,
    "deleteAfter" TIMESTAMPTZ(3) NOT NULL,
    "wasPublished" BOOLEAN NOT NULL,
    "noticeDismissedAt" TIMESTAMPTZ(3),

    CONSTRAINT "ResumeDeletion_pkey" PRIMARY KEY ("resumeId")
);

CREATE INDEX "ResumeDeletion_deleteAfter_idx" ON "ResumeDeletion"("deleteAfter");

ALTER TABLE "ResumeDeletion" ADD CONSTRAINT "ResumeDeletion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ResumeDeletion" ("resumeId", "deleteAfter", "wasPublished")
SELECT "id", "deletedAt" + INTERVAL '30 days', false
FROM "Resume"
WHERE "deletedAt" IS NOT NULL;
