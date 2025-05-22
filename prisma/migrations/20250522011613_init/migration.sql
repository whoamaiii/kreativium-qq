/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Goal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currentProgress` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `targetProgress` on the `Goal` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `kidId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pct` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetXp` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Activity";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Kid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL,
    "due" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "goalId" INTEGER NOT NULL,
    CONSTRAINT "Entry_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "targetXp" INTEGER NOT NULL,
    "pct" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kidId" INTEGER NOT NULL,
    CONSTRAINT "Goal_kidId_fkey" FOREIGN KEY ("kidId") REFERENCES "Kid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "id", "title", "updatedAt") SELECT "createdAt", "id", "title", "updatedAt" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Kid_name_key" ON "Kid"("name");
