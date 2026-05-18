/*
  Warnings:

  - You are about to drop the column `no_user` on the `hasil` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no_user` on the `users` table. All the data in the column will be lost.
  - Added the required column `username` to the `hasil` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `hasil` DROP FOREIGN KEY `hasil_no_user_fkey`;

-- AlterTable
ALTER TABLE `hasil` DROP COLUMN `no_user`,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `no_user`,
    ADD PRIMARY KEY (`username`);

-- AddForeignKey
ALTER TABLE `hasil` ADD CONSTRAINT `hasil_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
