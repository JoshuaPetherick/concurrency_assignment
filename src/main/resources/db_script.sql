CREATE DATABASE IF NOT EXISTS `shifts_and_employees`;
USE `shifts_and_employees`;

-- Set checks to Zero, so can drop table
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `employees`;

-- Re-assign check so it checks key possible when creating table
SET FOREIGN_KEY_CHECKS=1;
CREATE TABLE `employees`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
)ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Insert new employees into table
INSERT INTO `employees` (firstName, lastName, description) VALUES ('Bill', 'Baggins', 'Chef');
INSERT INTO `employees` (firstName, lastName, description) VALUES ('Ted', 'Baker', 'Waiter');
INSERT INTO `employees` (firstName, lastName, description) VALUES ('Fred', 'Cumberlin', 'Supervisor');

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `shifts`;

SET FOREIGN_KEY_CHECKS=1;
CREATE TABLE `shifts`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(255)  DEFAULT NULL,
  `day` varchar(255)  NOT NULL,
  `employeeId` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY(`id`),
  KEY `fk_shift_employeeIdx` (`employeeId`),
  CONSTRAINT `fk_shift_employeeid` FOREIGN KEY(`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- Insert new shifts into table
INSERT INTO `shifts` (description, day, employeeId) VALUES ('Prepare Medium-Rare Steak for Critic', 'Wednesday', 1);
INSERT INTO `shifts` (description, day, employeeId) VALUES ('Clean up the Kitchen', 'Thursday', NULL);