-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "pct" INTEGER NOT NULL,
    "pctComplete" INTEGER NOT NULL DEFAULT 0,
    "targetXp" INTEGER NOT NULL DEFAULT 100,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kidId" INTEGER NOT NULL,
    CONSTRAINT "Goal_kidId_fkey" FOREIGN KEY ("kidId") REFERENCES "Kid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "desc", "id", "isCompleted", "kidId", "pct", "pctComplete", "title", "updatedAt") SELECT "createdAt", "desc", "id", "isCompleted", "kidId", "pct", "pctComplete", "title", "updatedAt" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
