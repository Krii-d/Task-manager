/*
  Warnings:

  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL;
