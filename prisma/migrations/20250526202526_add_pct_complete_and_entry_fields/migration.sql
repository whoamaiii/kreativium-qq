/*
  Warnings:

  - Added the required column `delta` to the `Entry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kidId` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL,
    "due" DATETIME,
    "notes" TEXT,
    "delta" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kidId" INTEGER NOT NULL,
    "goalId" INTEGER NOT NULL,
    CONSTRAINT "Entry_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Entry" ("activity", "createdAt", "due", "goalId", "id", "status", "subject", "updatedAt", "notes", "delta", "kidId") 
SELECT "activity", "createdAt", "due", "goalId", "id", "status", "subject", "updatedAt", NULL as "notes", 0 as "delta", 
  (SELECT "kidId" FROM "Goal" WHERE "Goal"."id" = "Entry"."goalId") as "kidId" 
FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
CREATE TABLE "new_Goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "targetXp" INTEGER NOT NULL,
    "pct" INTEGER NOT NULL,
    "pctComplete" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kidId" INTEGER NOT NULL,
    CONSTRAINT "Goal_kidId_fkey" FOREIGN KEY ("kidId") REFERENCES "Kid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "desc", "id", "kidId", "pct", "targetXp", "title", "updatedAt") SELECT "createdAt", "desc", "id", "kidId", "pct", "targetXp", "title", "updatedAt" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
