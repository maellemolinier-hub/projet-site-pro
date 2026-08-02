-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFYING', 'QUALIFIED', 'PROPOSAL_SENT', 'MEETING_REQUESTED', 'MEETING_BOOKED', 'LOST');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT');

-- CreateTable
CREATE TABLE "LeadAssistantSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessDescription" TEXT,
    "bookingLink" TEXT,
    "minIntentScore" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "slackTeamId" TEXT,
    "slackTeamName" TEXT,
    "slackBotToken" TEXT,
    "slackUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadAssistantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SLACK',
    "externalId" TEXT NOT NULL,
    "contactName" TEXT,
    "contactHandle" TEXT,
    "intentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intentSummary" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadProposal" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadAssistantSettings_userId_key" ON "LeadAssistantSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadAssistantSettings_slackTeamId_key" ON "LeadAssistantSettings"("slackTeamId");

-- CreateIndex
CREATE INDEX "LeadAssistantSettings_slackTeamId_idx" ON "LeadAssistantSettings"("slackTeamId");

-- CreateIndex
CREATE INDEX "LeadConversation_userId_idx" ON "LeadConversation"("userId");

-- CreateIndex
CREATE INDEX "LeadConversation_status_idx" ON "LeadConversation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversation_userId_channel_externalId_key" ON "LeadConversation"("userId", "channel", "externalId");

-- CreateIndex
CREATE INDEX "LeadMessage_conversationId_idx" ON "LeadMessage"("conversationId");

-- CreateIndex
CREATE INDEX "LeadProposal_conversationId_idx" ON "LeadProposal"("conversationId");

-- AddForeignKey
ALTER TABLE "LeadAssistantSettings" ADD CONSTRAINT "LeadAssistantSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConversation" ADD CONSTRAINT "LeadConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadMessage" ADD CONSTRAINT "LeadMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "LeadConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProposal" ADD CONSTRAINT "LeadProposal_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "LeadConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
