/*
  Warnings:

  - The primary key for the `hasil` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no_hasil` on the `hasil` table. All the data in the column will be lost.
  - The primary key for the `penilaian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no_penilaian` on the `penilaian` table. All the data in the column will be lost.
  - Added the required column `kode_hasil` to the `hasil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode_penilaian` to the `penilaian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hasil` DROP PRIMARY KEY,
    DROP COLUMN `no_hasil`,
    ADD COLUMN `kode_hasil` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`kode_hasil`);

-- AlterTable
ALTER TABLE `penilaian` DROP PRIMARY KEY,
    DROP COLUMN `no_penilaian`,
    ADD COLUMN `kode_penilaian` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`kode_penilaian`);
