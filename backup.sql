-- MySQL dump 10.13  Distrib 5.7.28, for Linux (x86_64)
--
-- Host: localhost    Database: db_course
-- ------------------------------------------------------
-- Server version	5.7.28-0ubuntu0.18.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(454) DEFAULT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Desarrollo','Este es un video de desarrollo web y movil.','1'),(2,'Hacking','Este es una categoria de hackers','1'),(3,'Redes','Esta es una categoría en donde se enseña todo lo relacionado a redes.','1');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` int(11) NOT NULL,
  `name` varchar(455) NOT NULL,
  `description` varchar(10000) DEFAULT NULL,
  `price` float NOT NULL,
  `document_description` varchar(455) DEFAULT NULL,
  `begin_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `image` varchar(455) DEFAULT NULL,
  `link_media` varchar(455) NOT NULL,
  `modality_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(45) NOT NULL DEFAULT '1',
  `duration` float NOT NULL,
  `is_important` varchar(1) DEFAULT '2',
  `is_in_offer` varchar(1) DEFAULT '2',
  `offer_price` float DEFAULT NULL,
  `with_date` varchar(45) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `category_fk_idx` (`category_id`),
  KEY `modality_fk_idx` (`modality_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `provide_id_idx` (`provider`),
  CONSTRAINT `category_fk` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `modality_fk` FOREIGN KEY (`modality_id`) REFERENCES `modality` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `provide_id` FOREIGN KEY (`provider`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,56,'React Native','Pariatur occaecat elit voluptate deserunt nulla labore ex magna reprehenderit proident officia enim. Sunt duis veniam fugiat voluptate nisi proident minim consequat. Consequat sint reprehenderit pariatur nulla. Quis enim sit in aliquip qui. Minim occaecat anim non tempor id sint aliquip nulla minim nulla sint tempor culpa irure. Magna consectetur veniam et fugiat. Magna exercitation consequat do reprehenderit nulla sunt consequat.\n\nDeserunt excepteur eiusmod occaecat commodo labore quis non aliqua sit sit dolor officia. Ad nisi ut qui quis cupidatat veniam irure esse minim aliquip occaecat consequat minim ut. Mollit duis excepteur proident cillum occaecat.\n\nQui irure ut reprehenderit culpa. Ut cupidatat velit eiusmod voluptate. Exercitation aute dolore excepteur anim et in duis voluptate exercitation eu ea cillum. Elit eu culpa dolor sit consequat quis nisi enim Lorem. Est eiusmod cupidatat culpa incididunt mollit quis nostrud est. Mollit reprehenderit proident velit officia. Aute et laborum ullamco irure cupidatat tempor consequat laboris ea in fugiat commodo.\n\nSunt aliquip enim irure deserunt do et pariatur qui duis anim aute tempor exercitation. Elit sit nulla ea veniam deserunt sunt voluptate. Laborum sit dolore consectetur nulla incididunt minim dolor ad non. Id irure velit reprehenderit laboris commodo non commodo incididunt. Adipisicing officia officia excepteur aliquip exercitation irure magna. Ad enim id eu nisi cillum sint elit enim enim adipisicing aliquip eiusmod id. Consectetur officia consectetur minim dolor elit eiusmod.',10,'','2019-12-09','2019-12-18',1,'306.png','https://www.youtube.com/watch?v=mjKBjRevfq0',2,26,'1',100,'1','2',NULL,'1'),(2,56,'Hacking Hackers','Un curso donde podrá aprender técnicas de seguridad de redes (hacking).',10,'261.pdf','2019-12-12','2019-12-20',2,'260.jpg','https://www.youtube.com/watch?v=d75LLlxZqu8',2,26,'1',9,'1','1',5,'1'),(3,56,'Node como experto','',10,'914.pdf','2019-12-10','2019-12-10',1,'913.jpeg','https://www.youtube.com/watch?v=TRQQz9kaLv0',1,26,'2',10,'2','2',NULL,'1'),(4,56,'NestJs ','Nest como experto',90,'131.pdf','2019-12-13','2019-12-20',1,'130.png','https://www.youtube.com/watch?v=TRQQz9kaLv0',1,26,'1',10,'1','2',NULL,'1'),(5,59,'CISCO Routering  ','Curso brindado por personas especializadas en routers de CISCO.',150,'651.pdf','2019-12-13','2019-12-19',3,'650.png','youtube.com',1,26,'1',50,'2','2',NULL,'1'),(6,59,'Flutter','Curso de Flutter ',10,'891.pdf','2019-12-17','2019-12-25',1,'890.jpg','https://www.youtube.com/watch?v=NdYWuo9OFAw',1,26,'2',10,'2','2',NULL,'1'),(7,56,'React Native','Este es un curso de react native',0,'258.pdf','2019-12-18','2019-12-18',1,'257.jpg','https://youtube.com',1,26,'1',10,'2','2',NULL,'1'),(8,59,'Curso','',50,'734.pdf','2019-12-18','2019-12-28',2,'733.jpg','https://youtube.com',2,26,'1',4,'2','2',NULL,'1'),(9,59,'Favicon','Icons Fabulosos',10,'925.pdf','2019-12-18','2019-12-18',1,'924.png','https://www.youtube.com/watch?v=UQ92eyxnxmQ',1,26,'1',10,'2','2',NULL,'1'),(10,59,'JWT','',0,'228.pdf','2019-12-20','2019-12-20',1,'227.jpg','https://jwt.io/',1,26,'1',10,'1','2',NULL,'1'),(12,56,'NestJs','Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).',100,'12-113.pdf','2019-12-31','2019-12-31',1,'12-193.jpg','https://docs.nestjs.com/',1,26,'1',10,'1','1',80,'1'),(13,56,'Prueba','',0,'',NULL,NULL,2,'85.jpg','https://stackoverflow.com/questions/44719811/illegal-operation-on-a-directory-open',2,26,'1',10,'1','2',NULL,'2'),(14,56,'VueJs','Este es un curso de Vue',0,'450.pdf',NULL,NULL,1,'444.jpg','www.google.com',1,26,'2',10,'1','2',NULL,'2'),(15,56,'VueJs','Este es un curso de Vue',0,'857.pdf',NULL,NULL,1,'855.jpg','www.google.com',1,26,'1',10,'1','2',NULL,'2');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_user`
--

DROP TABLE IF EXISTS `course_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT '2',
  `request_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_fk_idx` (`user_id`),
  KEY `course_fk_idx` (`course_id`),
  CONSTRAINT `course_fk` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_user`
--

LOCK TABLES `course_user` WRITE;
/*!40000 ALTER TABLE `course_user` DISABLE KEYS */;
INSERT INTO `course_user` VALUES (9,61,2,'1','2020-03-27 20:09:51',NULL),(14,61,5,'1','2020-03-28 18:32:50',''),(15,61,10,'1','2020-03-28 18:35:27',''),(16,61,4,'1','2020-04-04 05:12:28',''),(19,70,8,'1','2020-04-04 06:00:28',''),(20,70,5,'1','2020-04-04 06:02:38',''),(22,70,4,'1','2020-04-04 06:05:45',''),(23,70,9,'1','2020-04-04 06:08:26',''),(24,70,9,'2','2020-04-04 06:09:35',''),(25,70,12,'1','2020-04-04 06:13:58',''),(26,70,12,'2','2020-04-04 06:15:05',''),(27,70,12,'2','2020-04-04 06:17:51','');
/*!40000 ALTER TABLE `course_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modality`
--

DROP TABLE IF EXISTS `modality`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modality` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(455) DEFAULT NULL,
  `description` varchar(455) DEFAULT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modality`
--

LOCK TABLES `modality` WRITE;
/*!40000 ALTER TABLE `modality` DISABLE KEYS */;
INSERT INTO `modality` VALUES (1,'A distancia','Esta es una modalidad a distancia.','1'),(2,'Presencial','Una modalidad que el user tiene que estar presente.','1');
/*!40000 ALTER TABLE `modality` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(454) DEFAULT NULL,
  `status` varchar(45) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Administrador','Este es el administrador de la app','1'),(2,'Estudiante','Este es el rol de estudiante','1'),(8,'Profesor ','Este usuario es el encargado de impartir cursos.','1');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `picture_url` varchar(150) DEFAULT NULL,
  `twitter` varchar(150) DEFAULT NULL,
  `facebook` varchar(150) DEFAULT NULL,
  `instagram` varchar(150) DEFAULT NULL,
  `phone` varchar(150) DEFAULT NULL,
  `sex` varchar(2) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  `linkedin` varchar(150) DEFAULT NULL,
  `description` varchar(1500) DEFAULT NULL,
  `adress` varchar(1500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_user_idx` (`user_id`),
  CONSTRAINT `id_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profile`
--

LOCK TABLES `user_profile` WRITE;
/*!40000 ALTER TABLE `user_profile` DISABLE KEYS */;
INSERT INTO `user_profile` VALUES (9,'Jefer','',NULL,'','','','23123123','2',11,'2','',NULL,NULL),(10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,12,'1',NULL,NULL,NULL),(13,'null','null','null','null','null','null','+584245558208','',16,'1',NULL,NULL,'San lorenzo'),(14,'null','null','null','null','null','null','null','',17,'1',NULL,NULL,NULL),(15,'No posee','',NULL,'','','','5454546','1',18,'1','',NULL,NULL),(16,'null','null','null','null','null','null','null','',19,'1',NULL,NULL,NULL),(17,'null','null','null','null','null','null','null','',20,'1',NULL,NULL,NULL),(18,'null','null','905.png','null','null','null','null','',21,'1',NULL,NULL,NULL),(19,'Jeferson','null','31.png','null','null','null','null','',22,'1',NULL,NULL,NULL),(20,'Jeferson','Alvarado','606.png','null','null','null','null','',23,'1',NULL,NULL,NULL),(21,'Jeferson','Alvarado','960.png','null','null','null','null','',24,'1',NULL,NULL,NULL),(22,'Jeferson','Alvarado','25-273.jpg','@jeferson','Jeferson Josue','JefersonJAC96','04245558208','1',25,'1',NULL,NULL,NULL),(23,'Carlos','Echeverria','26-150.jpg','@carlos.echeverria','Carlos','Instagram','04245558208','1',26,'1','Carlos.link','','Av principal2'),(24,'Jeferson','Alvarado','27-565.png','@jeferson','Jeferson Josue','JefersonJAC96','04245558208','1',27,'1',NULL,NULL,NULL),(25,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,28,'1',NULL,NULL,NULL),(26,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,29,'1',NULL,NULL,NULL),(27,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,30,'1',NULL,NULL,NULL),(28,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,31,'1',NULL,NULL,NULL),(29,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,32,'1',NULL,NULL,NULL),(30,'Jeferson','Alvarado','33-671.png','@jeferson','Jeferson Josues','JefersonJAC96','04245558208','1',33,'1',NULL,NULL,NULL),(31,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,34,'1',NULL,NULL,NULL),(32,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,35,'1',NULL,NULL,NULL),(33,'Example','','36-175.jpg','','jefersonjosue.alvaradocamacho','JefersonJAC96','0424558208',NULL,36,'1','Jefersondevelop',NULL,NULL),(34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,37,'1',NULL,NULL,NULL),(35,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,38,'1',NULL,NULL,NULL),(36,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,39,'2',NULL,NULL,NULL),(37,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,40,'1',NULL,NULL,NULL),(38,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,41,'1',NULL,NULL,NULL),(39,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,42,'1',NULL,NULL,NULL),(40,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,43,'1',NULL,NULL,NULL),(41,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,44,'1',NULL,NULL,NULL),(42,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,45,'1',NULL,NULL,NULL),(43,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,46,'1',NULL,NULL,NULL),(44,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,47,'1',NULL,NULL,NULL),(45,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,48,'1',NULL,NULL,NULL),(46,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,49,'1',NULL,NULL,NULL),(47,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,50,'1',NULL,NULL,NULL),(48,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,51,'1',NULL,NULL,NULL),(49,'Jeferson ','Alvarado','null','null','null','null','null','1',52,'1','',NULL,NULL),(50,'null','null','null','null','null','null','null','',53,'1',NULL,NULL,NULL),(51,'null','null','null','null','null','null','null','',54,'2',NULL,NULL,NULL),(52,'Jeferson','Alvarado','null','','','null','04245558208','1',55,'1','',NULL,NULL),(53,'Julio','Martinez','null','null','null','null','04245558208','1',56,'1','','Un profesor con ganas de enseñar a todos. Graduado de la Universidad Centroccidental Lisandro Alvarado.',NULL),(54,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,57,'1',NULL,NULL,NULL),(55,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,58,'1',NULL,NULL,NULL),(56,'Fernando','Herrera','null','null','null','null','04245558208','',59,'1','','Un profesor con ganas de enseñar a todos. Graduado de la Universidad de Harvard. jeje','Direccion'),(57,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,60,'1',NULL,NULL,NULL),(66,'Jeferson','',NULL,'','','','04245558208','1',61,'1','','','Av. Principal'),(67,'Estudia','nte','null','null','null','null','0424555','1',62,'2',NULL,'',NULL),(68,'Example','',NULL,'','','','04245558208','1',63,'1','','Soy un desarrolllador web.','Ciudad Bolivar, Bolivar - Venezuela'),(70,'example','exam',NULL,NULL,NULL,NULL,'041254887','1',65,'1',NULL,'Trabajó en Colaboral en el área Tecnología como Desarrollador web','Barquisimeto, Lara - Venezuela'),(71,'Un estudiante','de paso',NULL,NULL,NULL,NULL,'04245558208','1',66,'1',NULL,'','Barquisimeto, Lara - Venezuela'),(72,'Example','undefined',NULL,NULL,NULL,NULL,'undefined','1',70,'1',NULL,'Trabajó en Empresa en el área Area como Cargo','Mobarakeh, Esfahan - Iran'),(73,'s','undefined',NULL,NULL,NULL,NULL,'undefined','1',71,'1',NULL,'Trabajó en d en el área d como d','al-Muharraq, al-Muharraq - Bahrain');
/*!40000 ALTER TABLE `user_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `confirm_password` varchar(150) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  `role_id` int(11) NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `id_role_idx` (`role_id`),
  CONSTRAINT `id_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'jejoalca143@gmail.com','$2b$10$HJ0Zaqij0zh/zxF9t9X3weAEKysNQnPI50m2rJHzxaYh3LxYYn1/W','$2b$10$YrmlBL6krAs9ma.dzCesk.7IEUXhoc7buSdj4I71aqKD/HvGpheZq','2',1),(12,'jejoalca1423@gmail.com','$2b$10$rlB2f87cqrsCAImQqK2sv.R37F1h.HpZ9sm/FxCd1OYQH0ycGkzCS','$2b$10$C1XaXhpHQsqpJ1ZfdeZXNetmab19UDPiQR1gW7Akht74GVCLt/Qvu','1',2),(16,'jejoalca14@gmail.com','$2b$10$moId.KHStLn.vsUWshNRauXxopmxCki97TMN4wEwmuiYVVyIs26D2','$2b$10$wCUaXNGjNbo0fkAGj9CG0O1jgI8Enh9vPs5wvaOR5kDwNUKcB9nYa','1',1),(17,'jejoalca15@gmail.com','$2b$10$aGQK6TbGgmr2yVmo6AsN3OI/Qf/d4Uq.zeC5DMND9jxW8hjL6zXNS','$2b$10$yUDByuQFFPdqMl2vDIzmBuqXBM5RrXgaNMKrtFKhitt/701EZcieO','1',2),(18,'jejoalca16@gmail.com','$2b$10$Yz5KN1HGf/zRQKTbzNSngOuRFny1NsM.9DagGflL/0rBo646qdsQS','$2b$10$vIqwLDwwYoUTPIF24IRgG.MHBE3DlhYj9dlRlztakDHBvCJ9LtOaC','1',2),(19,'jejoalca17@gmail.com','$2b$10$LO.Xkwa26xnGEaRNqqwAcOtwoXvPBAbk6hNrbu/2vDEAFtwoTKTHK','$2b$10$pgPzl6A8Uh7p3mLPZ1a7YeCYERWWJ6Rn2EYHZNW7HBxq/vmYfCXne','1',2),(20,'jejoalca18@gmail.com','$2b$10$nYEdukcTezdhzgK5cQe7S.mexfx854Tv3p/hQvIVTlstBznZmILSy','$2b$10$Ad/RZchr5O9OTchos.1eyuuUC.AY0xFCPTweYOTGX78QlaVolsKo6','1',1),(21,'jejoalca19@gmail.com','$2b$10$qHWlXxHF2VTfcZfTFmOK8OF5xtmE7WHm0RPaYx3iBM/DACnwkqhg2','$2b$10$XqMI5rYe21usU3g8fQ3NVOaGfM909uCMfwX4tFMEHz05T0cZlTXti','1',2),(22,'jejoalca11@gmail.com','$2b$10$u86kqf7erd53FQwNNIvs0e5UfkmdIU1Ve1iUG8uv5EGW9qsUa/XTi','$2b$10$X3yh5lykYxBBqABjy8HPI.AjZ6G1KPjdGrNVtP30IJQzW9Fj/qdT6','1',2),(23,'jejoalca1@gmail.com','$2b$10$F/3loX0VJJOE6GFUGE3UPOie43kiDHfxSwO2J/7ahaVu2Zhz3dE/2','$2b$10$CuQhBS9f2kG6o/IUN3CC3uOEntsE1VVHy4FDGJKZB.x9DHQprHohi','1',2),(24,'jejoalcad1@gmail.com','$2b$10$Leq6kfJxy5e3kUd1DnMCS.I.ksQCW.iG4Vs325K64qLWYh7.cx/Ay','$2b$10$mI231pCsJrM8Fw4EQbF0vuLcb6T6QcecMXDAlZF8psssl9MNrYHXS','1',2),(25,'jejoalc1@gmail.com','123456','123456','2',2),(26,'jejoalc12@gmail.com','$2b$10$ik79ZQnp.kMd4s.2onXrCOpWvdfNiHzy9nPGnX/VhACJX0tk0W3IW','$2b$10$YZfJERNvOpH7DI1A9EdUiewlwPqEU/ghG44LvQdUYwPgIIz3PkddG','1',1),(27,'jejoalc1t52@gmail.com','$2b$10$4faMps9nalCqn/yxJeGO8OWHxSbXHGVfpchvOr.iXUBqdZF2eYj9K','$2b$10$5B4X3x8K2xCYLSCcASk/9.ewoPddLtWa88FhWBMtKPLgi6dNbPJeG','1',2),(28,'jejoalct52@gmail.com','$2b$10$p6a4YjKymZeGv4T7ie1.FOesxELtaAIKylnxIbxXzyCgbijbzdgPq','$2b$10$7uhCNA96QzZSRrOMwLo81.CnuEFrUTU6.Je5A1SoI0EjR3ZSTJzV.','1',2),(29,'jejoalc5t52@gmail.com','$2b$10$v5H6DkFK92Rh7SEIW8y6lO.tPkoAUsdvRngM.Gq5vVsaRC7HGV6G.','$2b$10$b.mSLN.czdQFqZNFqbCgqeaYhNsCxwtUkNZX9FGwi.58Z7b9VmI5.','1',2),(30,'jeje@gmail.com','$2b$10$lzta73CAVuCgtwA43jtrsuWswnu7XuHObsj4oxzX8SAAo5qGGkrHK','$2b$10$5TwwAPs/HABElUuCwLbruOpM6Y/W6X5LRTpWYTgVggW3gzcgGkLC6','1',2),(31,'jeje1@gmail.com','$2b$10$GfZmM9Zp8zwrFKFYGBu9Y.HtbNhTgH8l6NGofAk.4e5/dZbR41oIa','$2b$10$OwqbiY4HLH6ptYOU/QtvG.7jy3kasVYYxqPGskiEFk1ZRw2aFmqke','1',2),(32,'jeje13@gmail.com','$2b$10$3lYPAb6utE8MJhu4Q09cH.7ucSyHumTfP3PM8uzVIsSGUk60rfDUS','$2b$10$dKwMfq8VayaIlyf6bhNpFeSpBUYQRRrgHJy/5Bw.gwoKrqfN6Vnhy','1',2),(33,'jeje135@gmail.com','123456','123456','1',2),(34,'jejoalca_14@hotmail.com','$2b$10$VTtj4GaIvtJAdOxt4wT8POcMa6P41qkOWEuvvDgp9Q8b5LP8KmZ/e','$2b$10$WnEY6QLJo072LK.hFEo3BOOr8ALd229i19Hk2EWTyhRNyVu1jFe4m','1',2),(35,'admin@fivo.com','$2b$10$bO1xRM5I3PBbcW0UNqdQwOWvahSnsSey9B5tESyzfr7F/L.dcIttm','$2b$10$pREqRuGe5gnLrjrdn40M.ue7E1p5GvBJhnKuthrHMHXDCJSCXCBPu','1',2),(36,'jeferson@gmail.com','$2b$10$Rv3G7kyPe5/XNBQoOfAJY.aV3mgcGxg3xNr2v8ebwSNPjobMAMoRC','$2b$10$MpZ15qE2W35QKmvIhn6BWuwA4VkFoK.UKOxnS5pOHbRKqgCicRGjW','1',2),(37,'jeferson2@gmail.com','$2b$10$.q/7jZ.F12/VLW2CYIQ38eUbWyadL.O9kY8oA1RYyzTdvUmPIXtIq','$2b$10$ZUa/.Vh4BmADI34qWKXQoelQ7U0hTjgHfZJxy1eraSk45/FSTKFSi','1',2),(38,'admin2@fivo.com','$2b$10$AY7oCaJnNHPTDfAB6D5sn.v/FIMga6FGAZ0XPMwlZKHL1XBBPnFS6','$2b$10$cOmvDn12IgcnvLk8avvuhu3PZjr70LsCeLvbyyC94sVjEBG4guJb6','1',2),(39,'carlos@gmail.com','$2b$10$JDFoXd1Oj8tRyYCjN7SZruYT2ph69GtPy6BmOCMRwKUnbzEeVG/9W','$2b$10$ZTZFoPfnwfkOCjQe8RMCpOBXi5hpwuRg82nsE6Gfcm1A5xoVNDFRG','1',2),(40,'carlos@gail.com','$2b$10$tieXOSI7.LP9i3VDRgQiZeXXttgpPgTLefIRGy9O73CP3lr4Nl38W','$2b$10$QaR/oouJatFBbNsBRAcexund1Th.ZJq1ItnyvCzK4ctsGYhFgs8Se','1',2),(41,'carlos12@gmail.com','$2b$10$7fRWA2a4UryLcyagb3zx.u8pdGXVBnTHt0AACWs6dRRRcUOfGNheq','$2b$10$rQBlyduzhfllkO0V1ke/1.jQc0I47CvjgoxZyPwZ5r3abSs1jgQty','1',2),(42,'carlos123@gmail.com','$2b$10$C/S1kAY5.i82KBIQCUIXQuH9pxlEKkrtSLwcnYdVq8dhj8v5tN19a','$2b$10$ekzVBRT1SMel29lsSVYdh.WhINaPJF7rHYBTEUq5fX48MiKOiBYiu','1',2),(43,'jeferson23@gmail.com','$2b$10$GaOsNhoG./tpQ2713EVOPO864I6cDtwFJoGeLyILiH7.nSPVKubr6','$2b$10$r72BY8Frse.9vlkGV3M2buQL3tpC9SgNRvtLbsPyT9F.goEmeEe1C','2',1),(44,'eumir@gmail.com','$2b$10$QrLZbQGFqxWV7Ca1TrSPyu2Awz2j95c5heTTe469CwyLBBZzF47ny','$2b$10$555vBG5ff4gWVdSQuiCvUuC40TKiYUNFooMhBLR.wkG5lu5wzO5qu','1',2),(45,'jejoal@gmail.com','$2b$10$zqOgF3ReX48iiQ.F6rUuLeO12/Qp/BAihb0tpT1E2wPmMXFWp5wCW','$2b$10$Ebm5R8gSMUjIYMWTQzTZZejDPJXzFLmZADV1VJfqWHl6y6hyqrpC2','1',2),(46,'jejoal2@gmail.com','$2b$10$v.J/NpmWoFX4G9db/z5sB.AzDJ5O0lQybp/rv5BoJG0J9MimEoOMG','$2b$10$YLbH.9VMVm9zYckcFCqVhuGX4qvA/bCCa6uLKjgyM25.6aSTooGkq','1',2),(47,'jejoal3@gmail.com','$2b$10$41VSvT0WQNneQ1IpUGQt7eXFxONaCg21CgDJ48KqKhFIJJE04aa7u','$2b$10$AYeFO8rEF1jpv3i..plodex2nSR.BH3iYrs5IBZQtiq5R9Xz6fM/e','1',2),(48,'jejoal4@gmail.com','$2b$10$/FrCtcfz7JM/78A7L7t0POMj3DcrdkOTKDgRzQ7uGpZJSkYQ4pekC','$2b$10$P2jSB5nteQvuj3aduUEWU.Jk9.QlRJgmiSJVaAKEoIFdtRHyvY3s.','1',2),(49,'jejoal5@gmail.com','$2b$10$/VufreX8ieor5uYyr6Oo9OeM2cG96OAI00ya5N4OSJHGJatrqDNn.','$2b$10$m5GclDg8.1xHUCIA7v.5JuZ7J23neSHC99RPPn6iwQKQ7tpsKwAd2','1',2),(50,'jejoal7@gmail.com','$2b$10$Jr4vfThhmrwmJhYnrDjZX.Yh59V4FboWeB51vmzsBYV37xpJzCZWS','$2b$10$2GdTu5S5qTti9XoFdt45IeHIcqtwSogrwlbtinj8Tg.Q8z.aLSrKu','1',2),(51,'echeverriadev@gmail.com','$2b$10$.U3QHHC1xtvfWh/05VZwouPbdgY0naU1Iv/l2tYvHnuybmjPsJDL6','$2b$10$RQ1cVQIgUyBbzyASu2kMeONTM0zRJuYQvecV/9Zu4BK3YDERgXgbS','1',2),(52,'jejoalca145@gmail.com','$2b$10$IDFEHrybx.wo0k5Svp7tZOwFMtAukLFmYg7Pf2.aONAq4pSWOJYVS','$2b$10$Agt6odNVFGPX6ow9chK3huyhVteCr/VasyLu4L9gosFcvApKMqRzO','1',2),(53,'admin32@fivo.com','$2b$10$M4GJB0pW5u9m5DMzGEXWfOKxutDuVV8oW27vbB8swMo4xqQH3yBqu','$2b$10$LF4Ayx24ffHJqgI5OJPISuvBdYB9RP0hNMeLLa1NPoai108zdA8VS','1',2),(54,'jeferson235@gmail.com','$2b$10$Ngweh8SLEaROzg9G/kk17uRidfgcvKgb3JS36r5DHCYxoB8Jggvgu','$2b$10$CiWHSQfFE5hwTwI.4GfEn.96lZGxdtmWF38ReayiSFbYrUqy4N0Lq','2',1),(55,'jefersonalvarado@gmail.com','$2b$10$DgEnwuhHxUIWwSBfcyjLheBsZB6W4dCiuAKwtwB9.9D51gz6gyXCO','$2b$10$0kXJJ0geiqIY5EGMhI1RbO/OHCFq1BHXWeLW.CTrRw2orLc5i6GBS','1',2),(56,'julio@gmail.com','$2b$10$tNl6fYbs6NiPcmssy3PM5.zDjisAbl9k5J7kIDMxuEaQrvTPeML7S','$2b$10$YM4jYt0GZiSdsuAOFoYbDORa6Ta9WRY/oFnfwYxTiHmYU.QRI.vW.','1',8),(57,'example@gmail.com','$2b$10$6VRUOxtOV1AOOR0ysF5J4O.JntMiMPCM0HmjaN4eM8VLk4TB7fzJe','$2b$10$6VGca1kXrmldxzRfgla4h.qIXL7lUNTdo7mH06ZeGi8.J9XarXd.G','1',2),(58,'josu@gmail.com','$2b$10$Ju3oTygO//sVkVOLlMASW.s6qfOeckCSO/HXomCOaqPtaLFewjAo2','$2b$10$WSiAIWDcGWKmhfL/6hZ5l.Tq3dDwfb/SEvh4FzaDDgLRcMapnumoS','1',2),(59,'teacher.example@gmail.com','$2b$10$k3zrDbE.gk.R9LH7Fvg8LOvIEezFR4bHrklyI09YjlaW1qL/6Tu5a','$2b$10$wAtWTyClSk4ei9bakMBHN.u.Mq.VBxSqt8kXhdzRTxhjWYQTJiGt2','1',8),(60,'estudiante@exam.com','$2b$10$Hx78UguNgRvmYV9WyKrEIegdas73lEufCkHbzU3PC57iALZZ.UhDi','$2b$10$xiXLjMlI68aZmKUtVfKvxu00NmbLHwSvXxdD0DXuWWrWsj9N.lKMe','1',2),(61,'jejoalca13@gmail.com','$2b$10$/akfXZDbnOV9m1U5.i8/v.5yo45dgNq9DXQEPD/UrKaEevezozTgu','$2b$10$DEToVPJ6FYhVzxv5lcxOAOQwv7BRUVn0eHfZfbve8wHeaXvBKXvMy','1',2),(62,'estudiante2@example.com','$2b$10$HuB2SmRz6vsCwPxH2tmks.DY0drej0fPD2ziy137a9dCERfxDpfLC','$2b$10$8zuIVUOlSS4G0bWaSBI5ZeSPqivnHpb76Ft6hNu8xp9uevvMd7aCe','2',2),(63,'jejoalca124@gmail.com','$2b$10$U/7fYnnvb1iMBMZxiASF/.AVKh7E3.aBT2WBRE/YuG6NMbs.f174m','$2b$10$5.k.BiBZjq1xawCTqOLYwuW5dqt3osx0ADPIevn4DTv3x7gnj14sW','1',2),(65,'example@gmai.com','$2b$10$T6Q8Yfhtos08DzWHaN8dRubRf4enX6d61Y1A4eXt05dhgqD7kvM.e','$2b$10$yonuTyTHq/gBhjiD85vjEe6SZZ6.DViccReTrt9M7hL8A71haiHiu','1',2),(66,'email@email.com','$2b$10$kxbCKaDx98j.zmcOitZ3qO4pJrEjYvB0P3hS2JaQTymr6Ma1f2LQy','$2b$10$MsPKuVXae.VTfHL4hsxnG.TD2pWZLSp5zqd.XfdPKTlXuuVixVyHO','1',2),(67,'email2@email.com','$2b$10$fXlFlKpZPLt3UhRUeGUHheAb3dSoNz.vGOcp6TNkDn0ng.o.20ObC','$2b$10$DLenJQPR2Ww1tMfV1grAQeu2pyc5FLvjK8xU6CyIObgALrVVkD4KG','1',2),(68,'email3@email.com','$2b$10$h0vqM8XDPcDSVMs9/G2sN.4/h8gPrwp9czSAUsyZ9EyxJJJ5r/bWW','$2b$10$kAriosUxuuxm2E5594OVrOG1O03cbNnYaoX79fjCH2Ibojw6E/HcS','1',2),(69,'email4@email.com','$2b$10$HxzZXplzFzS5.4WZ0wsvHu/2aMdi7g9KNiACT.zANSCmth7L23rRK','$2b$10$unOibov9cdqajKtiCOv5rOlNT2D/kng4HB26c7QtO8o5ldkSnDvWm','1',2),(70,'email5@email.com','$2b$10$L1x2Awesw9AUUhxYdrxGo.fjSuhsNwlC.at71ioix8f9YQx20S59K','$2b$10$7TXKKcpW/pq0v4ljsV/naeOPJ.Lr3WyV1zHCSZUZowxy0btA0nNvu','1',2),(71,'jejoalc120@gmail.com','$2b$10$tmWY89Hoh.lsYJS5zOhlx.Fctzuc3kKsl1MiNIlbEqn09vE499q.a','$2b$10$NwzeuIYVSmzzHfY0oKvGJud4wL/r788xkRu1fRIIegILPJ7meEVMi','1',2);
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

-- Dump completed on 2020-04-04 20:00:59
