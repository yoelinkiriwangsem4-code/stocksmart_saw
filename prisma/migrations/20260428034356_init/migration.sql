-- CreateTable
CREATE TABLE `users` (
    `no_user` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `tipe_pengguna` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`no_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saham` (
    `kode_saham` VARCHAR(191) NOT NULL,
    `nama_perusahaan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kode_saham`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kriteria` (
    `kode_kriteria` VARCHAR(191) NOT NULL,
    `nama_kriteria` VARCHAR(191) NOT NULL,
    `bobot` DOUBLE NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kode_kriteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penilaian` (
    `no_penilaian` VARCHAR(191) NOT NULL,
    `kode_saham` VARCHAR(191) NOT NULL,
    `kode_kriteria` VARCHAR(191) NOT NULL,
    `nilai` DOUBLE NOT NULL,

    PRIMARY KEY (`no_penilaian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasil` (
    `no_hasil` VARCHAR(191) NOT NULL,
    `no_user` VARCHAR(191) NOT NULL,
    `kode_saham` VARCHAR(191) NOT NULL,
    `nilai_preferensi` DOUBLE NOT NULL,
    `ranking` INTEGER NOT NULL,

    PRIMARY KEY (`no_hasil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `penilaian` ADD CONSTRAINT `penilaian_kode_saham_fkey` FOREIGN KEY (`kode_saham`) REFERENCES `saham`(`kode_saham`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian` ADD CONSTRAINT `penilaian_kode_kriteria_fkey` FOREIGN KEY (`kode_kriteria`) REFERENCES `kriteria`(`kode_kriteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil` ADD CONSTRAINT `hasil_no_user_fkey` FOREIGN KEY (`no_user`) REFERENCES `users`(`no_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasil` ADD CONSTRAINT `hasil_kode_saham_fkey` FOREIGN KEY (`kode_saham`) REFERENCES `saham`(`kode_saham`) ON DELETE RESTRICT ON UPDATE CASCADE;
