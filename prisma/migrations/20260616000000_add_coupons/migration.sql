CREATE TABLE `Coupon` (
  `id`          VARCHAR(191) NOT NULL,
  `code`        VARCHAR(191) NOT NULL,
  `discountPct` INTEGER      NOT NULL,
  `label`       VARCHAR(191) NOT NULL,
  `isActive`    BOOLEAN      NOT NULL DEFAULT true,
  `expiresAt`   DATETIME(3)  NULL,
  `usageLimit`  INTEGER      NULL,
  `usageCount`  INTEGER      NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL,

  UNIQUE INDEX `Coupon_code_key` (`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
