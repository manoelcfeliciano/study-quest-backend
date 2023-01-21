/*
  Warnings:

  - The values [Student,Teacher] on the enum `RoleEnumType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleEnumType_new" AS ENUM ('student', 'teacher');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "RoleEnumType_new" USING ("role"::text::"RoleEnumType_new");
ALTER TYPE "RoleEnumType" RENAME TO "RoleEnumType_old";
ALTER TYPE "RoleEnumType_new" RENAME TO "RoleEnumType";
DROP TYPE "RoleEnumType_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
