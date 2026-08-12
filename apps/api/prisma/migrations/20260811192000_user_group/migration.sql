-- CreateEnum
CREATE TYPE "UserGroup" AS ENUM ('ADMIN', 'GENERAL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "group" "UserGroup" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "users_group_idx" ON "users"("group");
