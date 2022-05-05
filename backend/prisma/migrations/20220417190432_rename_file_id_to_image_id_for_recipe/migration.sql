/*
  Warnings:

  - You are about to drop the column `fileId` on the `recipe` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `recipe` DROP FOREIGN KEY `recipe_fileId_fkey`;

-- AlterTable
ALTER TABLE `recipe` DROP COLUMN `fileId`,
    ADD COLUMN `imageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `recipe` ADD CONSTRAINT `recipe_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
