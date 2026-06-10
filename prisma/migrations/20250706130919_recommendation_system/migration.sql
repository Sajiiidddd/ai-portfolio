/*
  Warnings:

  - You are about to alter the column `review` on the `Recommendation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - Added the required column `userId` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Recommendation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RecType" AS ENUM ('MOVIE', 'SONG');

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "RecType" NOT NULL,
ALTER COLUMN "review" SET DATA TYPE VARCHAR(50);

-- CreateTable
CREATE TABLE "RecommendationVote" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationVote_recommendationId_userId_key" ON "RecommendationVote"("recommendationId", "userId");

-- CreateIndex
CREATE INDEX "Recommendation_createdAt_idx" ON "Recommendation"("createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_upvotes_idx" ON "Recommendation"("upvotes");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- AddForeignKey
ALTER TABLE "RecommendationVote" ADD CONSTRAINT "RecommendationVote_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
