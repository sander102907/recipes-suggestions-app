-- DropForeignKey
ALTER TABLE `recipe` DROP FOREIGN KEY `recipe_imageId_fkey`;

-- CreateTable
CREATE TABLE `IngredientPriceHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NOT NULL,
    `isBonus` BOOLEAN NOT NULL,
    `from` DATETIME(3) NOT NULL,
    `until` DATETIME(3) NULL,
    `ingredientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recipe` ADD CONSTRAINT `recipe_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngredientPriceHistory` ADD CONSTRAINT `IngredientPriceHistory_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
