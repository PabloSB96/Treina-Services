USE treinaapi;

-- ----------------------------
-- DROP TABLES
-- ----------------------------
DROP TABLE IF EXISTS treina_treinee_exercice;
DROP TABLE IF EXISTS treina_treinee_food;
DROP TABLE IF EXISTS treina_team;
DROP TABLE IF EXISTS treina_trainer_exercice;
DROP TABLE IF EXISTS treina_trainer_food;
DROP TABLE IF EXISTS treina_default_exercice;
DROP TABLE IF EXISTS treina_default_food;
DROP TABLE IF EXISTS treina_food_type;
DROP TABLE IF EXISTS treina_user_measures_history;
DROP TABLE IF EXISTS treina_user_measures;
DROP TABLE IF EXISTS treina_user;


-- ----------------------------
-- CREATE TABLES
-- ----------------------------
CREATE TABLE IF NOT EXISTS treina_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    sex VARCHAR(1) NOT NULL,
    birth_date BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(500),
    is_trainer BOOLEAN DEFAULT (FALSE),
    trainer_code BOOLEAN,
    current_height_cm BIGINT,
    current_weight_kg BIGINT,
    current_goal VARCHAR(500),
    current_goal_full VARCHAR(2000),
    device_id VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS treina_user_measures_history (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    height_cm BIGINT NOT NULL,
    weight_kg BIGINT NOT NULL,
    chest_cm BIGINT NOT NULL,
    arm_cm BIGINT NOT NULL,
    waist_cm BIGINT NOT NULL,
    hip_cm BIGINT NOT NULL,
    gluteus_cm BIGINT NOT NULL,
    thigh_cm BIGINT NOT NULL,
    trainee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_food_type (
	id BIGINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS treina_default_exercice (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS treina_default_food (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    food_type_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_type_id) REFERENCES treina_food_type(id)
);
CREATE TABLE IF NOT EXISTS treina_trainer_exercice(
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    default_repetitions VARCHAR(100) NOT NULL,
    default_rest VARCHAR(100) NOT NULL,
    default_series VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainer_id BIGINT NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_trainer_food(
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    observations VARCHAR(2000) NOT NULL,
    default_amount VARCHAR(500) NOT NULL,
    food_type_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainer_id BIGINT NOT NULL,
    FOREIGN KEY (food_type_id) REFERENCES treina_food_type(id),
    FOREIGN KEY (trainer_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_team (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trainer_id BIGINT NOT NULL,
    trainee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES treina_user(id),
    FOREIGN KEY (trainee_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_treinee_exercice (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    observations VARCHAR(2000) NOT NULL,
    default_repetitions VARCHAR(100) NOT NULL,
    default_rest VARCHAR(100) NOT NULL,
    default_series VARCHAR(100) NOT NULL,
    on_monday BOOLEAN DEFAULT(false),
    on_tuesday BOOLEAN DEFAULT(false),
    on_wednesday BOOLEAN DEFAULT(false),
    on_thursday BOOLEAN DEFAULT(false),
    on_friday BOOLEAN DEFAULT(false),
    on_saturday BOOLEAN DEFAULT(false),
    on_sunday BOOLEAN DEFAULT(false),
    trainee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_treinee_food (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    default_amount VARCHAR(500) NOT NULL,
    on_monday BOOLEAN DEFAULT(false),
    on_tuesday BOOLEAN DEFAULT(false),
    on_wednesday BOOLEAN DEFAULT(false),
    on_thursday BOOLEAN DEFAULT(false),
    on_friday BOOLEAN DEFAULT(false),
    on_saturday BOOLEAN DEFAULT(false),
    on_sunday BOOLEAN DEFAULT(false),
    food_type_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainee_id BIGINT NOT NULL,
    FOREIGN KEY (food_type_id) REFERENCES treina_food_type(id),
    FOREIGN KEY (trainee_id) REFERENCES treina_user(id)
);

COMMIT;


-- ----------------------------
-- ADDING DATA TO TABLES
-- ----------------------------
INSERT INTO treina_food_type(id, code) VALUES (1, 'desayuno');
INSERT INTO treina_food_type(id, code) VALUES (2, 'almuerzo');
INSERT INTO treina_food_type(id, code) VALUES (3, 'comida');
INSERT INTO treina_food_type(id, code) VALUES (4, 'merienda');
INSERT INTO treina_food_type(id, code) VALUES (5, 'cena');
INSERT INTO treina_food_type(id, code) VALUES (6, 'suplemento');
COMMIT;