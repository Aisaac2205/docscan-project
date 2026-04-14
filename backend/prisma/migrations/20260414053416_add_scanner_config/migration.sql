-- CreateTable
CREATE TABLE "ScannerConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 80,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScannerConfig_userId_idx" ON "ScannerConfig"("userId");

-- AddForeignKey
ALTER TABLE "ScannerConfig" ADD CONSTRAINT "ScannerConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
