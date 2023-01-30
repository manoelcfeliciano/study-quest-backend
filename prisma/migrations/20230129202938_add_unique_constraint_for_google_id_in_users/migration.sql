/*
  Warnings:

  - A unique constraint covering the columns `[email,name,googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_email_idx";

-- DropIndex
DROP INDEX "users_email_name_key";

-- CreateIndex
CREATE INDEX "users_email_googleId_idx" ON "users"("email", "googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_name_googleId_key" ON "users"("email", "name", "googleId");
