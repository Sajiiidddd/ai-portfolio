/*
  Warnings:

  - You are about to drop the column `message` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `image` on table `Blog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `author` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_blogId_fkey";

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "message",
DROP COLUMN "name",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "Vote";

-- DropEnum
DROP TYPE "VoteType";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
