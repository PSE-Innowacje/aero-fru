-- V16: Seed data for dictionary tables

--------------------------------------------------------
-- Crew roles
--------------------------------------------------------
INSERT INTO FRU_DICT_CREW_ROLES (name) VALUES ('Pilot');
INSERT INTO FRU_DICT_CREW_ROLES (name) VALUES ('Obserwator');

--------------------------------------------------------
-- User roles
--------------------------------------------------------
INSERT INTO FRU_DICT_USER_ROLES (name) VALUES ('Administrator');
INSERT INTO FRU_DICT_USER_ROLES (name) VALUES ('Osoba planująca');
INSERT INTO FRU_DICT_USER_ROLES (name) VALUES ('Osoba nadzorująca');
INSERT INTO FRU_DICT_USER_ROLES (name) VALUES ('Pilot');

--------------------------------------------------------
-- Activity types
--------------------------------------------------------
INSERT INTO FRU_DICT_ACTIVITY_TYPES (name) VALUES ('oględziny wizualne');
INSERT INTO FRU_DICT_ACTIVITY_TYPES (name) VALUES ('skan 3D');
INSERT INTO FRU_DICT_ACTIVITY_TYPES (name) VALUES ('lokalizacja awarii');
INSERT INTO FRU_DICT_ACTIVITY_TYPES (name) VALUES ('zdjęcia');
INSERT INTO FRU_DICT_ACTIVITY_TYPES (name) VALUES ('patrolowanie');

--------------------------------------------------------
-- Operation statuses (explicit IDs from PRD)
--------------------------------------------------------
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (1, 'Wprowadzone');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (2, 'Odrzucone');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (3, 'Potwierdzone do planu');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (4, 'Zaplanowane do zlecenia');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (5, 'Częściowo zrealizowane');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (6, 'Zrealizowane');
INSERT INTO FRU_DICT_OPERATION_STATUSES (id, name) VALUES (7, 'Rezygnacja');

--------------------------------------------------------
-- Flight order statuses (explicit IDs from PRD)
--------------------------------------------------------
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (1, 'Wprowadzone');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (2, 'Przekazane do akceptacji');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (3, 'Odrzucone');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (4, 'Zaakceptowane');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (5, 'Zrealizowane w części');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (6, 'Zrealizowane w całości');
INSERT INTO FRU_DICT_FLIGHT_ORDER_STATUSES (id, name) VALUES (7, 'Nie zrealizowane');

COMMIT;
