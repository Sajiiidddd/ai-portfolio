-- CreateTable
CREATE TABLE "AgentQuery" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "source" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentQuery_createdAt_idx" ON "AgentQuery"("createdAt");
