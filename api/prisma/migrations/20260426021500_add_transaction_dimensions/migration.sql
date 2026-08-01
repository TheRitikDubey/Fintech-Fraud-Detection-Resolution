-- Drop legacy optional field if it exists in local databases.
ALTER TABLE "Transaction"
DROP COLUMN IF EXISTS "cardId";

-- Persist important CSV attributes.
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "mcc" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "merchant" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "Transaction_mcc_idx" ON "Transaction"("mcc");
