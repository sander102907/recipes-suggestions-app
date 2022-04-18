-- AlterTable
ALTER TABLE `recipe` ADD COLUMN `fileId` INTEGER NULL;

-- CreateTable
CREATE TABLE `File` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(200) NOT NULL,
    `encoding` VARCHAR(191) NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `size` INTEGER NOT NULL,

    UNIQUE INDEX `File_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recipe` ADD CONSTRAINT `recipe_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
