use db;

ALTER DATABASE db CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE IF EXISTS trainer_exercices;
DROP TABLE IF EXISTS client_trainer;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(200) NOT NULL,
    `name` varchar(100) NOT NULL,
    `surname` varchar(500) NOT NULL,
    `istrainer` BOOLEAN NOT NULL default 0, 
    `password` varchar(200) NOT NULL,
    `trainercode` varchar(100),
    `photo` varchar(500),
    PRIMARY KEY (`id`),
    UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS client_trainer (
    `id` int NOT NULL AUTO_INCREMENT,
    `client` int NOT NULL,
    `trainer` int NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`client`) REFERENCES users(`id`),
    FOREIGN KEY (`trainer`) REFERENCES users(`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS trainer_exercices (
    `id` int NOT NULL AUTO_INCREMENT,
    `trainer` int NOT NULL,
    `title` varchar(200) NOT NULL,
    `description` varchar(1000) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`trainer`) REFERENCES users(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;