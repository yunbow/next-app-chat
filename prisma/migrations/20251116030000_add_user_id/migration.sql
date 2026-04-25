-- AlterTable
ALTER TABLE "users" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE INDEX "users_userId_idx" ON "users"("userId");
