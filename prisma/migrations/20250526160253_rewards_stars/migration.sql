-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Kid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Kid" ("id", "name") SELECT "id", "name" FROM "Kid";
DROP TABLE "Kid";
ALTER TABLE "new_Kid" RENAME TO "Kid";
CREATE UNIQUE INDEX "Kid_name_key" ON "Kid"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
