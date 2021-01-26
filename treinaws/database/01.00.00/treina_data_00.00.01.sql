DELETE FROM db.users;
DELETE FROM db.client_trainer;

INSERT INTO db.users(email, name, surname, istrainer, password) VALUES ('pablosanchezbello@gmail.com', 'Pablo', 'Sánchez Bello', 0, 'pass1234');
INSERT INTO db.users(email, name, surname, istrainer, password) VALUES ('samuelsanchezbello@gmail.com', 'Samuel', 'Sánchez Bello', 0, 'pass1234');
INSERT INTO db.users(email, name, surname, istrainer, password) VALUES ('elenabellomallo@gmail.com', 'María Elena', 'Bello Mallo', 0, 'pass1234');
INSERT INTO db.users(email, name, surname, istrainer, password, trainercode) VALUES ('antoniosanchezsanchez@gmail.com', 'Antonio', 'Sánchez Sánchez', 1, 'pass1234', 'ANTONIO1234');

INSERT INTO db.client_trainer(client, trainer) VALUES ((SELECT id FROM db.users WHERE email = 'pablosanchezbello@gmail.com'), (SELECT id FROM db.users WHERE email = 'antoniosanchezsanchez@gmail.com'));
INSERT INTO db.client_trainer(client, trainer) VALUES ((SELECT id FROM db.users WHERE email = 'samuelsanchezbello@gmail.com'), (SELECT id FROM db.users WHERE email = 'antoniosanchezsanchez@gmail.com'));

INSERT INTO db.trainer_exercices(title, description, trainer) VALUES ('Flexiones', 'Lorem ipsum', (SELECT id FROM db.users WHERE email = 'antoniosanchezsanchez@gmail.com'));
INSERT INTO db.trainer_exercices(title, description, trainer) VALUES ('Abdominales', 'Lorem ipsum', (SELECT id FROM db.users WHERE email = 'antoniosanchezsanchez@gmail.com'));
INSERT INTO db.trainer_exercices(title, description, trainer) VALUES ('Sentadillas', 'Lorem ipsum', (SELECT id FROM db.users WHERE email = 'antoniosanchezsanchez@gmail.com'));
