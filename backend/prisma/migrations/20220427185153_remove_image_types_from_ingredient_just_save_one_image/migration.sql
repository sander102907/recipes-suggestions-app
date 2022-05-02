/*
  Warnings:

  - You are about to drop the column `image_large` on the `ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `image_medium` on the `ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `image_small` on the `ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `image_tiny` on the `ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ingredient` DROP COLUMN `image_large`,
    DROP COLUMN `image_medium`,
    DROP COLUMN `image_small`,
    DROP COLUMN `image_tiny`,
    ADD COLUMN `image` VARCHAR(200) NULL;
