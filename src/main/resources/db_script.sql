CREATE DATABASE IF NOT EXISTS `shifts_and_employees`;
USE `shifts_and_employees`;

DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `version` int(11) unsigned DEFAULT 0,
  PRIMARY KEY (`id`)
)ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Insert new employees into table
INSERT INTO `employee` (first_name, last_name, description) VALUES ("Bill", "Baggins", "Chef");
INSERT INTO `employee` (first_name, last_name, description) VALUES ("Ted", "Baker", "Waiter");
INSERT INTO `employee` (first_name, last_name, description) VALUES ("Fred", "Cumberlin", "Supervisor");

DROP TABLE IF EXISTS `shift`;
CREATE TABLE `shift`(
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(255)  DEFAULT NULL,
  `day` varchar(255)  NOT NULL,
  `employee_id` int(11) unsigned DEFAULT 0,
  `version` int(11) unsigned DEFAULT 0,
  PRIMARY KEY(`id`),
  KEY `fk_shift_employee_idx` (`employee_id`),
  CONSTRAINT `fk_shift_employee_id` FOREIGN KEY(`employee_id`) REFERENCES `employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- Insert new shifts into table
INSERT INTO `shift` (description, day, employee_id) VALUES ("Prepare Medium-Rare Steak for Critic", "Wednesday", 1);
INSERT INTO `shift` (description, day) VALUES ("Clean up the Kitchen", "Thursday");