-- AlterTable: Remove unused columns
-- Drop type column from groups table
PRAGMA foreign_keys=off;

CREATE TABLE "new_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_groups" ("id", "name", "description", "image", "createdById", "createdAt", "updatedAt")
SELECT "id", "name", "description", "image", "createdById", "createdAt", "updatedAt" FROM "groups";

DROP TABLE "groups";
ALTER TABLE "new_groups" RENAME TO "groups";

CREATE INDEX "groups_createdById_idx" ON "groups"("createdById");

-- Drop groupId column from notifications table
CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "messageId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_notifications" ("id", "userId", "type", "title", "content", "messageId", "isRead", "createdAt")
SELECT "id", "userId", "type", "title", "content", "messageId", "isRead", "createdAt" FROM "notifications";

DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";

CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- Drop lastMessageId column from direct_messages table
CREATE TABLE "new_direct_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "direct_messages_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "direct_messages_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_direct_messages" ("id", "user1Id", "user2Id", "createdAt", "updatedAt")
SELECT "id", "user1Id", "user2Id", "createdAt", "updatedAt" FROM "direct_messages";

DROP TABLE "direct_messages";
ALTER TABLE "new_direct_messages" RENAME TO "direct_messages";

CREATE UNIQUE INDEX "direct_messages_user1Id_user2Id_key" ON "direct_messages"("user1Id", "user2Id");
CREATE INDEX "direct_messages_user1Id_idx" ON "direct_messages"("user1Id");
CREATE INDEX "direct_messages_user2Id_idx" ON "direct_messages"("user2Id");
CREATE INDEX "direct_messages_updatedAt_idx" ON "direct_messages"("updatedAt");

PRAGMA foreign_keys=on;
