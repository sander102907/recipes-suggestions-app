-- CreateTable
CREATE TABLE `LogsCronjobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(16) NOT NULL,
    `message` VARCHAR(2048) NOT NULL,
    `metadata` VARCHAR(2048) NOT NULL,
    `timestamp` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogsPrisma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(16) NOT NULL,
    `message` VARCHAR(2048) NOT NULL,
    `metadata` VARCHAR(2048) NOT NULL,
    `timestamp` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
