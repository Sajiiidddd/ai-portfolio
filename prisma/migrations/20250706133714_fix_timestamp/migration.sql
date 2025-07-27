/*
  Warnings:

  - You are about to alter the column `timestamp` on the `Recommendation` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Recommendation" ALTER COLUMN "timestamp" SET DATA TYPE INTEGER;
