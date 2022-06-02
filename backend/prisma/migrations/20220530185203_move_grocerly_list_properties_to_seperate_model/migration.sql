/*
  Warnings:

  - You are about to drop the column `isInCart` on the `ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `isOnGrocerylist` on the `ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `isPermanentlyOnGrocerylist` on the `ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ingredient` DROP COLUMN `isInCart`,
    DROP COLUMN `isOnGrocerylist`,
    DROP COLUMN `isPermanentlyOnGrocerylist`;

-- CreateTable
CREATE TABLE `GroceryList` (
    `isCheckedOff` BOOLEAN NOT NULL,
    `isPermanent` BOOLEAN NOT NULL,
    `amount` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,

    PRIMARY KEY (`ingredientId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroceryList` ADD CONSTRAINT `GroceryList_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
