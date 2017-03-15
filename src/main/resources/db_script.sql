CREATE DATABASE IF NOT EXISTS `shifts_and_employees`;
USE `shifts_and_employees`;

DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
)ENGINE = InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `shift`;
CREATE TABLE `shift`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(255)  DEFAULT NULL,
  `day` varchar(255)  NOT NULL,
  `employeeId` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY(`id`),
  KEY `fk_shift_employeeIdx` (`employeeId`),
  CONSTRAINT `fk_shift_employeeid` FOREIGN KEY(`employeeId`) REFERENCES `employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;