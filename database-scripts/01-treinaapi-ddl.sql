USE treinaapi;

-- ----------------------------
-- DROP TABLES
-- ----------------------------
DROP TABLE IF EXISTS treina_trainee_exercice;
DROP TABLE IF EXISTS treina_shopping_element_trainee_food;
DROP TABLE IF EXISTS treina_trainee_food;
DROP TABLE IF EXISTS treina_team;
DROP TABLE IF EXISTS treina_trainer_exercice;
DROP TABLE IF EXISTS treina_shopping_element_trainer_food;
DROP TABLE IF EXISTS treina_trainer_food;
DROP TABLE IF EXISTS treina_default_exercice;
DROP TABLE IF EXISTS treina_shopping_element_default_food;
DROP TABLE IF EXISTS treina_default_food;
DROP TABLE IF EXISTS treina_food_type;
DROP TABLE IF EXISTS treina_user_measures_history;
DROP TABLE IF EXISTS treina_user_measures;
DROP TABLE IF EXISTS treina_user;
DROP TABLE IF EXISTS treina_plan;


-- ----------------------------
-- CREATE TABLES
-- ----------------------------
CREATE TABLE IF NOT EXISTS treina_plan (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    cost_month DOUBLE NOT NULL,
    cost_year DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS treina_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    sex VARCHAR(1),
    birth_date BIGINT,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(500),
    is_trainer BOOLEAN DEFAULT (FALSE),
    trainer_code VARCHAR(20),
    current_height_cm DOUBLE,
    current_weight_kg DOUBLE,
    current_goal VARCHAR(500),
    current_goal_full VARCHAR(2000),
    device_id VARCHAR(500),
    plan_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES treina_plan(id)
);
CREATE TABLE IF NOT EXISTS treina_user_measures_history (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    weight_kg DOUBLE NOT NULL,
    chest_cm DOUBLE NOT NULL,
    arm_cm DOUBLE NOT NULL,
    waist_cm DOUBLE NOT NULL,
    hip_cm DOUBLE NOT NULL,
    gluteus_cm DOUBLE NOT NULL,
    thigh_cm DOUBLE NOT NULL,
    trainee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_food_type (
	id BIGINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainer_id BIGINT NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES treina_user(id)
);
CREATE TABLE IF NOT EXISTS treina_trainer_food(
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    default_amount VARCHAR(500) NOT NULL,
    food_type_id BIGINT NOT NULL,
    on_monday BOOLEAN DEFAULT(false),
    on_tuesday BOOLEAN DEFAULT(false),
    on_wednesday BOOLEAN DEFAULT(false),
    on_thursday BOOLEAN DEFAULT(false),
    on_friday BOOLEAN DEFAULT(false),
    on_saturday BOOLEAN DEFAULT(false),
    on_sunday BOOLEAN DEFAULT(false),
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
CREATE TABLE IF NOT EXISTS treina_trainee_exercice (
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
CREATE TABLE IF NOT EXISTS treina_trainee_food (
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
CREATE TABLE IF NOT EXISTS treina_shopping_element_default_food (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    default_food_id BIGINT NOT NULL,
    FOREIGN KEY (default_food_id) REFERENCES treina_default_food(id)
);
CREATE TABLE IF NOT EXISTS treina_shopping_element_trainer_food (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainer_food_id BIGINT NOT NULL,
    FOREIGN KEY (trainer_food_id) REFERENCES treina_trainer_food(id)
);
CREATE TABLE IF NOT EXISTS treina_shopping_element_trainee_food (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trainee_food_id BIGINT NOT NULL,
    FOREIGN KEY (trainee_food_id) REFERENCES treina_trainee_food(id)
);
COMMIT;


-- ----------------------------
-- ADDING DATA TO TABLES
-- ----------------------------
INSERT INTO treina_food_type(id, code, title) VALUES (1, 'desayuno', 'Desayuno');
INSERT INTO treina_food_type(id, code, title) VALUES (2, 'almuerzo', 'Almuerzo');
INSERT INTO treina_food_type(id, code, title) VALUES (3, 'comida', 'Comida');
INSERT INTO treina_food_type(id, code, title) VALUES (4, 'merienda', 'Merienda');
INSERT INTO treina_food_type(id, code, title) VALUES (5, 'cena', 'Cena');
INSERT INTO treina_food_type(id, code, title) VALUES (6, 'suplemento', 'Suplemento');

INSERT INTO treina_plan(id, code, title, description, cost_month, cost_year) VALUES (1, 'basico', 'Básico', 'Plan básico inicial', 5.99, 50.99);
INSERT INTO treina_plan(id, code, title, description, cost_month, cost_year) VALUES (2, 'medium', 'Medium', 'Plan medio inicial', 10.99, 100.99);
INSERT INTO treina_plan(id, code, title, description, cost_month, cost_year) VALUES (3, 'premium', 'Premium', 'Plan completo inicial de la plataforma.', 15.99, 150.99);
COMMIT;