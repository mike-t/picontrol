/*
Navicat MySQL Data Transfer

Source Server         : Mikes Laptop
Source Server Version : 50707
Source Host           : 192.168.233.128:3306
Source Database       : picontrol

Target Server Type    : MYSQL
Target Server Version : 50707
File Encoding         : 65001

Date: 2015-07-02 14:40:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for controllers
-- ----------------------------
DROP TABLE IF EXISTS `controllers`;
CREATE TABLE `controllers` (
  `controller_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) NOT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`controller_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `controllers_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of controllers
-- ----------------------------
INSERT INTO `controllers` VALUES ('1', '1', '10.60.34.223', 'Brisbane Level 8 IT');
INSERT INTO `controllers` VALUES ('2', '1', '10.0.6.53', 'Brisbane Level G Bookstore');
INSERT INTO `controllers` VALUES ('3', '4', '10.60.129.147', 'Melbourne Level G Bookstore');

-- ----------------------------
-- Table structure for locations
-- ----------------------------
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of locations
-- ----------------------------
INSERT INTO `locations` VALUES ('1', 'Brisbane');
INSERT INTO `locations` VALUES ('2', 'Gold Coast');
INSERT INTO `locations` VALUES ('3', 'Sydney');
INSERT INTO `locations` VALUES ('4', 'Melbourne');
INSERT INTO `locations` VALUES ('5', 'Adelaide');
INSERT INTO `locations` VALUES ('6', 'Perth');
