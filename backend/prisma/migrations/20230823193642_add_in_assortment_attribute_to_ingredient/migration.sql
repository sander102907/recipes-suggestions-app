/*
  Warnings:

  - You are about to alter the column `timestamp` on the `LogsCronjobs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `timestamp` on the `LogsPrisma` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `LogsCronjobs` MODIFY `timestamp` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `LogsPrisma` MODIFY `timestamp` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `ingredient` ADD COLUMN `inAssortment` BOOLEAN DEFAULT true;
