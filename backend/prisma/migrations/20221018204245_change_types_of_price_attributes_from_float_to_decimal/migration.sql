-- AlterTable
ALTER TABLE `IngredientPriceHistory` MODIFY `price` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Receipt` MODIFY `subTotalPrice` DECIMAL(15, 2) NOT NULL,
    MODIFY `discount` DECIMAL(15, 2) NOT NULL,
    MODIFY `totalPrice` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `ingredient` MODIFY `price` DECIMAL(15, 2),
    MODIFY `bonus_price` DECIMAL(15, 2);
