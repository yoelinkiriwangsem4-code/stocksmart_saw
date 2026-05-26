-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_prismalab
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `hasil`
--

DROP TABLE IF EXISTS `hasil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hasil` (
  `kode_hasil` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `kode_saham` varchar(191) NOT NULL,
  `nilai_preferensi` double NOT NULL,
  `ranking` int(11) NOT NULL,
  PRIMARY KEY (`kode_hasil`),
  KEY `hasil_username_fkey` (`username`),
  KEY `hasil_kode_saham_fkey` (`kode_saham`),
  CONSTRAINT `hasil_kode_saham_fkey` FOREIGN KEY (`kode_saham`) REFERENCES `saham` (`kode_saham`) ON UPDATE CASCADE,
  CONSTRAINT `hasil_username_fkey` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hasil`
--

LOCK TABLES `hasil` WRITE;
/*!40000 ALTER TABLE `hasil` DISABLE KEYS */;
INSERT INTO `hasil` VALUES ('admin-BBCA-1779140850439-3','admin','BBCA',0.4164,4),('admin-BBNI-1779140850431-1','admin','BBNI',0.5875,2),('admin-BMRI-1779140850426-0','admin','BMRI',0.5885,1),('KageNo-BBCA-1779139957222-4','KageNo','BBCA',0.4929,5),('KageNo-BBNI-1779139957218-3','KageNo','BBNI',0.5468,4),('KageNo-BMRI-1779139957210-2','KageNo','BMRI',0.5579,3),('KageNo-BUKA-1779139957171-0','KageNo','BUKA',0.6013,1),('KageNo-GOTO-1779139957205-1','KageNo','GOTO',0.5816,2),('KageNo-ICBP-1779139957237-7','KageNo','ICBP',0.4679,8),('KageNo-MYOR-1779139957227-5','KageNo','MYOR',0.4776,6),('KageNo-UNVR-1779139957241-8','KageNo','UNVR',0.4051,9),('KageNo-WIFY-1779139957233-6','KageNo','WIFI',0.4758,7),('yoel-BUKA-1779179336922-2','yoel','BUKA',0.3695,3),('yoel-GOTO-1779179336906-1','yoel','GOTO',0.4062,2),('yoel-WIFI-1779179336880-0','yoel','WIFI',0.6692,1);
/*!40000 ALTER TABLE `hasil` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kriteria`
--

DROP TABLE IF EXISTS `kriteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kriteria` (
  `kode_kriteria` varchar(191) NOT NULL,
  `nama_kriteria` varchar(191) NOT NULL,
  `bobot` double NOT NULL,
  `tipe` varchar(191) NOT NULL,
  PRIMARY KEY (`kode_kriteria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriteria`
--

LOCK TABLES `kriteria` WRITE;
/*!40000 ALTER TABLE `kriteria` DISABLE KEYS */;
INSERT INTO `kriteria` VALUES ('C1','PER',0.2,'cost'),('C2','PBV',0.2,'cost'),('C3','ROE',0.2,'benefit'),('C4','DER',0.2,'cost'),('C5','EPS Growth',0.2,'benefit');
/*!40000 ALTER TABLE `kriteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penilaian`
--

DROP TABLE IF EXISTS `penilaian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penilaian` (
  `kode_penilaian` varchar(191) NOT NULL,
  `kode_saham` varchar(191) NOT NULL,
  `kode_kriteria` varchar(191) NOT NULL,
  `nilai` double NOT NULL,
  PRIMARY KEY (`kode_penilaian`),
  KEY `penilaian_kode_saham_fkey` (`kode_saham`),
  KEY `penilaian_kode_kriteria_fkey` (`kode_kriteria`),
  CONSTRAINT `penilaian_kode_kriteria_fkey` FOREIGN KEY (`kode_kriteria`) REFERENCES `kriteria` (`kode_kriteria`) ON UPDATE CASCADE,
  CONSTRAINT `penilaian_kode_saham_fkey` FOREIGN KEY (`kode_saham`) REFERENCES `saham` (`kode_saham`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penilaian`
--

LOCK TABLES `penilaian` WRITE;
/*!40000 ALTER TABLE `penilaian` DISABLE KEYS */;
/*!40000 ALTER TABLE `penilaian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saham`
--

DROP TABLE IF EXISTS `saham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saham` (
  `kode_saham` varchar(191) NOT NULL,
  `nama_perusahaan` varchar(191) NOT NULL,
  `harga` int(11) NOT NULL DEFAULT 0,
  `per` double NOT NULL,
  `pbv` double NOT NULL,
  `roe` double NOT NULL,
  `der` double NOT NULL,
  `eps_growth` double NOT NULL,
  `sektor` varchar(191) NOT NULL DEFAULT 'Perbankan',
  `username` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`kode_saham`),
  KEY `saham_username_fkey` (`username`),
  CONSTRAINT `saham_username_fkey` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saham`
--

LOCK TABLES `saham` WRITE;
/*!40000 ALTER TABLE `saham` DISABLE KEYS */;
INSERT INTO `saham` VALUES ('BBCA','Bank Central Asia Tbk',6125,12.86,2.76,21.72,5.11,481.44,'Perbankan',NULL),('BBNI','Bank Negara Indonesia Tbk',3800,6.2,2.53,18.91,6.51,665.96,'Perbankan',NULL),('BMRI','Bank Mandiri (Persero) Tbk',4130,6.19,0.82,13.31,7.41,613.64,'Perbankan',NULL),('BUKA','Bukalapak.com Tbk',132,-7.99,0.56,0.56,0.03,-16.52,'Teknologi',NULL),('GOTO','GoTo Gojek Tokopedia Tbk',50,54.35,1.97,2.21,0.62,0.92,'Teknologi',NULL),('ICBP','Indofood CBP Sukses Makmur Tbk',6800,7.73,1,13.04,0.8,879.96,'Konsumer',NULL),('MYOR','Mayora Indah Tbk',1780,10.54,2,19.01,0.48,168.84,'Konsumer',NULL),('UNVR','Unilever Indonesia Tbk',1770,7.88,22.5,104.86,1.65,224.74,'Konsumer',NULL),('WIFI','PT Solusi Sinergi Digital Tbk',2150,17.32,1.28,7.41,0.84,124.15,'Teknologi',NULL);
/*!40000 ALTER TABLE `saham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_kriteria`
--

DROP TABLE IF EXISTS `user_kriteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_kriteria` (
  `username` varchar(191) NOT NULL,
  `kode_kriteria` varchar(191) NOT NULL,
  `bobot` double NOT NULL,
  PRIMARY KEY (`username`,`kode_kriteria`),
  KEY `user_kriteria_kode_kriteria_fkey` (`kode_kriteria`),
  CONSTRAINT `user_kriteria_kode_kriteria_fkey` FOREIGN KEY (`kode_kriteria`) REFERENCES `kriteria` (`kode_kriteria`) ON UPDATE CASCADE,
  CONSTRAINT `user_kriteria_username_fkey` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_kriteria`
--

LOCK TABLES `user_kriteria` WRITE;
/*!40000 ALTER TABLE `user_kriteria` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_kriteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `tipe_pengguna` varchar(191) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin','123','admin'),('kageno','123456','user'),('yoel','123456','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 10:15:04
