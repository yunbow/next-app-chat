-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "type" TEXT NOT NULL DEFAULT 'group',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_groups" ("createdAt", "createdById", "description", "id", "image", "name", "updatedAt") SELECT "createdAt", "createdById", "description", "id", "image", "name", "updatedAt" FROM "groups";
DROP TABLE "groups";
ALTER TABLE "new_groups" RENAME TO "groups";
CREATE INDEX "groups_createdById_idx" ON "groups"("createdById");
CREATE INDEX "groups_type_idx" ON "groups"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
