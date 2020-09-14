-- MySQL Script generated by MySQL Workbench
-- Mon Sep 14 18:40:51 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mealsv2
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mealsv2
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mealsv2` DEFAULT CHARACTER SET utf8 ;
USE `mealsv2` ;

-- -----------------------------------------------------
-- Table `mealsv2`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(50) NOT NULL,
  `username` VARCHAR(20) NOT NULL,
  `password` VARCHAR(300) NOT NULL,
  `first_name` VARCHAR(20) NOT NULL,
  `last_name` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`meal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`meal` (
  `meal_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `public_meal_id` VARCHAR(255) NOT NULL,
  `user_user_id` INT NOT NULL,
  PRIMARY KEY (`meal_id`),
  INDEX `fk_meal_user_idx` (`user_user_id` ASC) VISIBLE,
  UNIQUE INDEX `meal_id_UNIQUE` (`meal_id` ASC) VISIBLE,
  UNIQUE INDEX `public_meal_id_UNIQUE` (`public_meal_id` ASC) VISIBLE,
  CONSTRAINT `fk_meal_user`
    FOREIGN KEY (`user_user_id`)
    REFERENCES `mealsv2`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`ingredient`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`ingredient` (
  `ingredient_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `public_ingredient_id` VARCHAR(255) NOT NULL,
  `user_user_id` INT NOT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE INDEX `ingredient_id_UNIQUE` (`ingredient_id` ASC) VISIBLE,
  INDEX `fk_ingredient_user1_idx` (`user_user_id` ASC) VISIBLE,
  UNIQUE INDEX `public_ingredient_id_UNIQUE` (`public_ingredient_id` ASC) VISIBLE,
  CONSTRAINT `fk_ingredient_user1`
    FOREIGN KEY (`user_user_id`)
    REFERENCES `mealsv2`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`meal_ingredient`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`meal_ingredient` (
  `meal_meal_id` INT NOT NULL,
  `ingredient_ingredient_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit` VARCHAR(10) NOT NULL,
  INDEX `fk_meal_ingredient_meal1_idx` (`meal_meal_id` ASC) VISIBLE,
  INDEX `fk_meal_ingredient_ingredient1_idx` (`ingredient_ingredient_id` ASC) VISIBLE,
  PRIMARY KEY (`ingredient_ingredient_id`, `meal_meal_id`),
  CONSTRAINT `fk_meal_ingredient_meal1`
    FOREIGN KEY (`meal_meal_id`)
    REFERENCES `mealsv2`.`meal` (`meal_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_meal_ingredient_ingredient1`
    FOREIGN KEY (`ingredient_ingredient_id`)
    REFERENCES `mealsv2`.`ingredient` (`ingredient_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`calendar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`calendar` (
  `calendar_id` INT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `meal_time` SET('breakfast', 'lunch', 'dinner', 'supper') NOT NULL,
  `public_calendar_id` VARCHAR(255) NOT NULL,
  `user_user_id` INT NOT NULL,
  `meal_meal_id` INT NOT NULL,
  `for_current_user` TINYINT NOT NULL,
  PRIMARY KEY (`calendar_id`),
  UNIQUE INDEX `idcalendar_UNIQUE` (`calendar_id` ASC) VISIBLE,
  INDEX `fk_calendar_user1_idx` (`user_user_id` ASC) VISIBLE,
  INDEX `fk_calendar_meal1_idx` (`meal_meal_id` ASC) VISIBLE,
  UNIQUE INDEX `public_meal_id_UNIQUE` (`public_calendar_id` ASC) VISIBLE,
  CONSTRAINT `fk_calendar_user1`
    FOREIGN KEY (`user_user_id`)
    REFERENCES `mealsv2`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calendar_meal1`
    FOREIGN KEY (`meal_meal_id`)
    REFERENCES `mealsv2`.`meal` (`meal_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`people`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`people` (
  `people_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(20) NOT NULL,
  `last_name` VARCHAR(20) NOT NULL,
  `public_people_id` VARCHAR(255) NOT NULL,
  `user_user_id` INT NOT NULL,
  PRIMARY KEY (`people_id`),
  UNIQUE INDEX `public_people_id_UNIQUE` (`public_people_id` ASC) VISIBLE,
  INDEX `fk_people_user1_idx` (`user_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_people_user1`
    FOREIGN KEY (`user_user_id`)
    REFERENCES `mealsv2`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mealsv2`.`calendar_people`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mealsv2`.`calendar_people` (
  `people_people_id` INT NOT NULL,
  `calendar_calendar_id` INT NOT NULL,
  INDEX `fk_calendar_people_people1_idx` (`people_people_id` ASC) VISIBLE,
  INDEX `fk_calendar_people_calendar1_idx` (`calendar_calendar_id` ASC) VISIBLE,
  PRIMARY KEY (`calendar_calendar_id`, `people_people_id`),
  CONSTRAINT `fk_calendar_people_people1`
    FOREIGN KEY (`people_people_id`)
    REFERENCES `mealsv2`.`people` (`people_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calendar_people_calendar1`
    FOREIGN KEY (`calendar_calendar_id`)
    REFERENCES `mealsv2`.`calendar` (`calendar_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
