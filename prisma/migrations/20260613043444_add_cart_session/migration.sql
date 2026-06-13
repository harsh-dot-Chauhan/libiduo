-- CreateTable
CREATE TABLE `CartSession` (
    `key` VARCHAR(191) NOT NULL,
    `items` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
