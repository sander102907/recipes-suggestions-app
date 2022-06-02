-- AlterTable
ALTER TABLE `ingredient` ADD COLUMN `isOnGrocerylist` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPermanentlyOnGrocerylist` BOOLEAN NOT NULL DEFAULT false;
