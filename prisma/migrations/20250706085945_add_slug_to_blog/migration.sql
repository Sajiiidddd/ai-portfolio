/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Blog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");
