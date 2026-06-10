-- AlterTable: add description, tags, readTime, published to Blog
ALTER TABLE "Blog"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "tags"        TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "readTime"    INTEGER,
  ADD COLUMN "published"   BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Blog_published_idx" ON "Blog"("published");
