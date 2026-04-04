-- Drop the old global name uniqueness so custom exercise names can be private per user.
DROP INDEX IF EXISTS "Exercise_name_key";

ALTER TABLE "Exercise"
ADD COLUMN "lookupKey" TEXT;

UPDATE "Exercise"
SET "lookupKey" = CASE
  WHEN "isLibrary" = true THEN 'library:' || lower(trim("name"))
  WHEN "createdById" IS NOT NULL THEN 'user:' || "createdById" || ':' || lower(trim("name"))
  ELSE 'exercise:' || "id"
END;

ALTER TABLE "Exercise"
ALTER COLUMN "lookupKey" SET NOT NULL;

CREATE UNIQUE INDEX "Exercise_lookupKey_key" ON "Exercise"("lookupKey");
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");
