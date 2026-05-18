/*
  Warnings:

  - Added the required column `der` to the `saham` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eps_growth` to the `saham` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pbv` to the `saham` table without a default value. This is not possible if the table is not empty.
  - Added the required column `per` to the `saham` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roe` to the `saham` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `saham` ADD COLUMN `der` DOUBLE NOT NULL,
    ADD COLUMN `eps_growth` DOUBLE NOT NULL,
    ADD COLUMN `pbv` DOUBLE NOT NULL,
    ADD COLUMN `per` DOUBLE NOT NULL,
    ADD COLUMN `roe` DOUBLE NOT NULL;
