-- CreateTable
CREATE TABLE "DocumentQuery" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentQuery_documentId_idx" ON "DocumentQuery"("documentId");

-- AddForeignKey
ALTER TABLE "DocumentQuery" ADD CONSTRAINT "DocumentQuery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
