use db;

ALTER DATABASE db CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(200) NOT NULL,
    `name` varchar(100) NOT NULL,
    `surname` varchar(500) NOT NULL,
    `istrainer` BOOLEAN NOT NULL default 0, 
    `password` varchar(200) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;