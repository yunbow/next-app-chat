-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "lastMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "direct_messages_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "direct_messages_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dm_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "senderId" TEXT NOT NULL,
    "directMessageId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dm_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dm_messages_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "direct_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dm_message_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dmMessageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dm_message_attachments_dmMessageId_fkey" FOREIGN KEY ("dmMessageId") REFERENCES "dm_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dm_message_reads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dmMessageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dm_message_reads_dmMessageId_fkey" FOREIGN KEY ("dmMessageId") REFERENCES "dm_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dm_message_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "direct_messages_user1Id_idx" ON "direct_messages"("user1Id");

-- CreateIndex
CREATE INDEX "direct_messages_user2Id_idx" ON "direct_messages"("user2Id");

-- CreateIndex
CREATE INDEX "direct_messages_updatedAt_idx" ON "direct_messages"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "direct_messages_user1Id_user2Id_key" ON "direct_messages"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "dm_messages_senderId_idx" ON "dm_messages"("senderId");

-- CreateIndex
CREATE INDEX "dm_messages_directMessageId_idx" ON "dm_messages"("directMessageId");

-- CreateIndex
CREATE INDEX "dm_messages_createdAt_idx" ON "dm_messages"("createdAt");

-- CreateIndex
CREATE INDEX "dm_message_attachments_dmMessageId_idx" ON "dm_message_attachments"("dmMessageId");

-- CreateIndex
CREATE INDEX "dm_message_reads_dmMessageId_idx" ON "dm_message_reads"("dmMessageId");

-- CreateIndex
CREATE INDEX "dm_message_reads_userId_idx" ON "dm_message_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dm_message_reads_dmMessageId_userId_key" ON "dm_message_reads"("dmMessageId", "userId");
