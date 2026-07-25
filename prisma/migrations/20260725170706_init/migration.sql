-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ANALYST', 'MODERATOR', 'READER');

-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('no_iniciada', 'en_progreso', 'parcialmente_cumplida', 'cumplida', 'incumplida', 'no_verificable');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('approved', 'rejected', 'changes_requested', 'escalated');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('official', 'press', 'ngo', 'academic', 'other');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('create', 'update', 'delete', 'status_change', 'score_recalculated', 'review_decision', 'login');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "organizationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gdprConsentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'ES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'ES',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'ES',
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "candidateId" TEXT,
    "authorId" TEXT NOT NULL,
    "currentStatus" "PromiseStatus" NOT NULL DEFAULT 'no_iniciada',
    "currentScore" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromiseStatusHistory" (
    "id" TEXT NOT NULL,
    "promiseId" TEXT NOT NULL,
    "fromStatus" "PromiseStatus",
    "toStatus" "PromiseStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromiseStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "baseUrl" TEXT,
    "trustWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "promiseId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "publishedAt" TIMESTAMP(3),
    "dimension" TEXT NOT NULL,
    "supportsProgress" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringDimension" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringDimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromiseScore" (
    "id" TEXT NOT NULL,
    "promiseId" TEXT NOT NULL,
    "scoreValue" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "algoVersion" TEXT NOT NULL,
    "computedById" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromiseScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReview" (
    "id" TEXT NOT NULL,
    "promiseId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_countryCode_key" ON "Organization"("name", "countryCode");

-- CreateIndex
CREATE INDEX "Election_electionDate_idx" ON "Election"("electionDate");

-- CreateIndex
CREATE UNIQUE INDEX "Election_countryCode_name_key" ON "Election"("countryCode", "name");

-- CreateIndex
CREATE INDEX "Party_countryCode_idx" ON "Party"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Party_countryCode_shortName_key" ON "Party"("countryCode", "shortName");

-- CreateIndex
CREATE INDEX "Candidate_partyId_idx" ON "Candidate"("partyId");

-- CreateIndex
CREATE INDEX "Candidate_electionId_idx" ON "Candidate"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_fullName_electionId_key" ON "Candidate"("fullName", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "Promise_slug_key" ON "Promise"("slug");

-- CreateIndex
CREATE INDEX "Promise_partyId_idx" ON "Promise"("partyId");

-- CreateIndex
CREATE INDEX "Promise_electionId_idx" ON "Promise"("electionId");

-- CreateIndex
CREATE INDEX "Promise_topic_idx" ON "Promise"("topic");

-- CreateIndex
CREATE INDEX "Promise_currentStatus_idx" ON "Promise"("currentStatus");

-- CreateIndex
CREATE INDEX "Promise_isPublished_idx" ON "Promise"("isPublished");

-- CreateIndex
CREATE INDEX "PromiseStatusHistory_promiseId_idx" ON "PromiseStatusHistory"("promiseId");

-- CreateIndex
CREATE INDEX "PromiseStatusHistory_createdAt_idx" ON "PromiseStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "EvidenceSource_type_idx" ON "EvidenceSource"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceSource_name_key" ON "EvidenceSource"("name");

-- CreateIndex
CREATE INDEX "EvidenceItem_promiseId_idx" ON "EvidenceItem"("promiseId");

-- CreateIndex
CREATE INDEX "EvidenceItem_sourceId_idx" ON "EvidenceItem"("sourceId");

-- CreateIndex
CREATE INDEX "EvidenceItem_dimension_idx" ON "EvidenceItem"("dimension");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringDimension_key_key" ON "ScoringDimension"("key");

-- CreateIndex
CREATE INDEX "PromiseScore_promiseId_idx" ON "PromiseScore"("promiseId");

-- CreateIndex
CREATE INDEX "PromiseScore_createdAt_idx" ON "PromiseScore"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationReview_promiseId_idx" ON "ModerationReview"("promiseId");

-- CreateIndex
CREATE INDEX "ModerationReview_reviewerId_idx" ON "ModerationReview"("reviewerId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseStatusHistory" ADD CONSTRAINT "PromiseStatusHistory_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "Promise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseStatusHistory" ADD CONSTRAINT "PromiseStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "Promise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EvidenceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseScore" ADD CONSTRAINT "PromiseScore_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "Promise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseScore" ADD CONSTRAINT "PromiseScore_computedById_fkey" FOREIGN KEY ("computedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "Promise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
