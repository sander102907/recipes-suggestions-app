-- AlterTable
ALTER TABLE `IngredientPriceHistory` MODIFY `price` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `ingredient` MODIFY `price` DECIMAL(15, 2),
    MODIFY `bonus_price` DECIMAL(15, 2);

-- CreateTable
CREATE TABLE `IngredientCategory` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
