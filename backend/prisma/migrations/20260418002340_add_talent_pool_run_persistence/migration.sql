-- CreateTable
CREATE TABLE "TalentPoolRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "criteriosSnapshot" JSONB NOT NULL,
    "candidatosSnapshot" JSONB NOT NULL,
    "rankingSnapshot" JSONB NOT NULL,
    "resumenGeneral" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentPoolRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentPoolRun_userId_idx" ON "TalentPoolRun"("userId");

-- CreateIndex
CREATE INDEX "TalentPoolRun_userId_createdAt_idx" ON "TalentPoolRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TalentPoolRun_userId_isPinned_createdAt_idx" ON "TalentPoolRun"("userId", "isPinned", "createdAt");

-- AddForeignKey
ALTER TABLE "TalentPoolRun" ADD CONSTRAINT "TalentPoolRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
