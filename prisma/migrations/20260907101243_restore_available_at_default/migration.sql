/*
  Warnings:

  - Made the column `availableAt` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "availableAt" SET NOT NULL,
ALTER COLUMN "availableAt" SET DEFAULT CURRENT_TIMESTAMP;
