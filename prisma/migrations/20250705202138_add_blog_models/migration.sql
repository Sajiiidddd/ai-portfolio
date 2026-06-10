/*
  Warnings:

  - The primary key for the `Blog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `slug` on the `Blog` table. All the data in the column will be lost.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_blogId_fkey";

-- DropIndex
DROP INDEX "Blog_slug_key";

-- AlterTable
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_pkey",
DROP COLUMN "slug",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "image" DROP NOT NULL,
ADD CONSTRAINT "Blog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Blog_id_seq";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "blogId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Comment_id_seq";

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
