/*
  Warnings:

  - A unique constraint covering the columns `[blogId,userId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add userId column with temporary default
ALTER TABLE "Vote"
ADD COLUMN "userId" TEXT DEFAULT 'anonymous-temp';

-- Step 2: Fill in random user IDs for duplicates (optional)
-- Skip this if you plan to just delete duplicates

-- Step 3: Delete duplicates keeping only 1 per blogId + userId
DELETE FROM "Vote"
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id",
           ROW_NUMBER() OVER (PARTITION BY "blogId", "userId" ORDER BY "createdAt") AS row_num
    FROM "Vote"
  ) t
  WHERE t.row_num > 1
);

-- Step 4: Make userId NOT NULL
ALTER TABLE "Vote"
ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Add unique constraint
ALTER TABLE "Vote"
ADD CONSTRAINT "Vote_blogId_userId_unique" UNIQUE ("blogId", "userId");



