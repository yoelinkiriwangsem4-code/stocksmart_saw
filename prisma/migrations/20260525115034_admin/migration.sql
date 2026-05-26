-- AlterTable
ALTER TABLE `saham` ADD COLUMN `harga` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sektor` VARCHAR(191) NOT NULL DEFAULT 'Perbankan',
    ADD COLUMN `username` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `user_kriteria` (
    `username` VARCHAR(191) NOT NULL,
    `kode_kriteria` VARCHAR(191) NOT NULL,
    `bobot` DOUBLE NOT NULL,

    INDEX `user_kriteria_kode_kriteria_fkey`(`kode_kriteria`),
    PRIMARY KEY (`username`, `kode_kriteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `saham_username_fkey` ON `saham`(`username`);

-- AddForeignKey
ALTER TABLE `saham` ADD CONSTRAINT `saham_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_kriteria` ADD CONSTRAINT `user_kriteria_kode_kriteria_fkey` FOREIGN KEY (`kode_kriteria`) REFERENCES `kriteria`(`kode_kriteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_kriteria` ADD CONSTRAINT `user_kriteria_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
