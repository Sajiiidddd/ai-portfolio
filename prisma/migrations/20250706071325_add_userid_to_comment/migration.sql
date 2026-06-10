/*
  Warnings:

  - Added the required column `userId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "userId" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "Vote_blogId_userId_unique" RENAME TO "Vote_blogId_userId_key";
