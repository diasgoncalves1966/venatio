-- Remove FISHING category: reassign existing rows, then rebuild enum
UPDATE "listings" SET "category" = 'OTHER' WHERE "category" = 'FISHING';

CREATE TYPE "ListingCategory_new" AS ENUM ('HUNTING', 'ACCESSORIES', 'CLOTHING', 'OTHER');

ALTER TABLE "listings" ALTER COLUMN "category" TYPE "ListingCategory_new" USING ("category"::text::"ListingCategory_new");

DROP TYPE "ListingCategory";

ALTER TYPE "ListingCategory_new" RENAME TO "ListingCategory";
