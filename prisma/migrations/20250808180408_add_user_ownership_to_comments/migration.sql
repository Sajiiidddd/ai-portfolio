/*
  Warnings:

  - You are about to drop the column `description` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `Comment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,blogId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropIndex
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_blogId_userId_key";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "description",
DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "author";

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_blogId_idx" ON "Comment"("blogId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Vote_blogId_idx" ON "Vote"("blogId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_blogId_key" ON "Vote"("userId", "blogId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
