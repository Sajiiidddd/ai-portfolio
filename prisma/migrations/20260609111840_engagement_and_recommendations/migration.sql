-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "year" TEXT,
    "review" TEXT NOT NULL,
    "recommendedBy" TEXT NOT NULL DEFAULT 'Anonymous',
    "userId" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationVote" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_confirmed_idx" ON "Subscriber"("confirmed");

-- CreateIndex
CREATE INDEX "Recommendation_type_idx" ON "Recommendation"("type");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_type_upvotes_idx" ON "Recommendation"("type", "upvotes");

-- CreateIndex
CREATE INDEX "RecommendationVote_recommendationId_idx" ON "RecommendationVote"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationVote_recommendationId_userId_key" ON "RecommendationVote"("recommendationId", "userId");

-- AddForeignKey
ALTER TABLE "RecommendationVote" ADD CONSTRAINT "RecommendationVote_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
