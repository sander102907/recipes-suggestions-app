/*
  Warnings:

  - You are about to drop the `recipe_ingredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `recipe_ingredients` DROP FOREIGN KEY `recipe_ingredients_ibfk_2`;

-- DropForeignKey
ALTER TABLE `recipe_ingredients` DROP FOREIGN KEY `recipe_ingredients_ibfk_1`;

-- DropTable
DROP TABLE `recipe_ingredients`;
