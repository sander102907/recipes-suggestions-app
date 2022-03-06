-- CreateTable
CREATE TABLE `ingredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ah_id` INTEGER NULL,
    `name` VARCHAR(50) NOT NULL,
    `unit_size` VARCHAR(50) NULL,
    `price` FLOAT NULL,
    `category` VARCHAR(50) NULL,
    `is_bonus` BOOLEAN NULL,
    `bonus_mechanism` VARCHAR(50) NULL,
    `bonus_price` FLOAT NULL,
    `image_tiny` VARCHAR(200) NULL,
    `image_small` VARCHAR(200) NULL,
    `image_medium` VARCHAR(200) NULL,
    `image_large` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingredients_in_group` (
    `group_id` INTEGER NOT NULL,
    `ingredient_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 1,

    INDEX `ingredient_id`(`ingredient_id`),
    PRIMARY KEY (`group_id`, `ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mysql_migrations_347ertt3e` (
    `timestamp` VARCHAR(254) NOT NULL,

    UNIQUE INDEX `timestamp`(`timestamp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` MEDIUMTEXT NULL,
    `is_suggested` BOOLEAN NULL,
    `exclude_from_suggestions` BOOLEAN NULL,
    `suggestion_end_date` DATE NULL,
    `rating` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_ingredients` (
    `recipe_id` INTEGER NOT NULL,
    `ingredient_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 1,

    INDEX `ingredient_id`(`ingredient_id`),
    PRIMARY KEY (`recipe_id`, `ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_ingredients_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipe_id` INTEGER NOT NULL,

    INDEX `tb_fk`(`recipe_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ingredients_in_group` ADD CONSTRAINT `ingredients_in_group_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingredients_in_group` ADD CONSTRAINT `ingredients_in_group_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `recipe_ingredients_group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_ingredients_group` ADD CONSTRAINT `tb_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
