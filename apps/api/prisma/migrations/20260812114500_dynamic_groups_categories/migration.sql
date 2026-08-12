-- Create groups and categories tables
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "groups_slug_key" ON "groups"("slug");

CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Seed default groups
INSERT INTO "groups" ("id", "slug", "name", "createdAt", "updatedAt") VALUES
  ('grp_admin', 'admin', 'Administrador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('grp_general', 'general', 'Geral', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed default categories
INSERT INTO "categories" ("id", "slug", "name", "createdAt", "updatedAt") VALUES
  ('cat_hunting', 'hunting', 'Caça', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_accessories', 'accessories', 'Acessórios', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_clothing', 'clothing', 'Vestuário', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_other', 'other', 'Outro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrate users.group enum -> groupId
ALTER TABLE "users" ADD COLUMN "groupId" TEXT;

UPDATE "users" SET "groupId" = 'grp_admin' WHERE "group" = 'ADMIN';
UPDATE "users" SET "groupId" = 'grp_general' WHERE "group" = 'GENERAL' OR "groupId" IS NULL;

ALTER TABLE "users" ALTER COLUMN "groupId" SET NOT NULL;
ALTER TABLE "users" DROP COLUMN "group";
DROP INDEX IF EXISTS "users_group_idx";
CREATE INDEX "users_groupId_idx" ON "users"("groupId");
ALTER TABLE "users" ADD CONSTRAINT "users_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate listings.category enum -> categoryId
ALTER TABLE "listings" ADD COLUMN "categoryId" TEXT;

UPDATE "listings" SET "categoryId" = 'cat_hunting' WHERE "category" = 'HUNTING';
UPDATE "listings" SET "categoryId" = 'cat_accessories' WHERE "category" = 'ACCESSORIES';
UPDATE "listings" SET "categoryId" = 'cat_clothing' WHERE "category" = 'CLOTHING';
UPDATE "listings" SET "categoryId" = 'cat_other' WHERE "category" = 'OTHER' OR "categoryId" IS NULL;

ALTER TABLE "listings" ALTER COLUMN "categoryId" SET NOT NULL;
DROP INDEX IF EXISTS "listings_status_category_idx";
ALTER TABLE "listings" DROP COLUMN "category";
CREATE INDEX "listings_status_categoryId_idx" ON "listings"("status", "categoryId");
ALTER TABLE "listings" ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old enums
DROP TYPE "UserGroup";
DROP TYPE "ListingCategory";
