-- Drop global unique on sourceUrl; enforce per-user uniqueness
DROP INDEX IF EXISTS "Entry_sourceUrl_key";

CREATE UNIQUE INDEX "Entry_userId_sourceUrl_key" ON "Entry"("userId", "sourceUrl");
