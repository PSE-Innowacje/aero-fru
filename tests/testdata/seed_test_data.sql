-- ============================================================
-- TEST DATA SEED SCRIPT for aero-fru API tests
-- Run AFTER Flyway migrations (V1-V17) have been applied.
-- Passwords are BCrypt hashes of 'Test1234'
-- ============================================================

--------------------------------------------------------
-- Test Users (one per role)
-- BCrypt hash of 'Test1234': $2b$10$up3/tYxTF0KZAbRt.q51A.p7YoILpauboQ0RrdzAPQsZBc/iploXa
--------------------------------------------------------
INSERT INTO FRU_USERS (id, first_name, last_name, email, password_hash, role_id)
VALUES (901, 'Admin', 'Testowy', 'admin@test.pl',
        '$2b$10$up3/tYxTF0KZAbRt.q51A.p7YoILpauboQ0RrdzAPQsZBc/iploXa', 1);

INSERT INTO FRU_USERS (id, first_name, last_name, email, password_hash, role_id)
VALUES (902, 'Planer', 'Testowy', 'planer@test.pl',
        '$2b$10$up3/tYxTF0KZAbRt.q51A.p7YoILpauboQ0RrdzAPQsZBc/iploXa', 2);

INSERT INTO FRU_USERS (id, first_name, last_name, email, password_hash, role_id)
VALUES (903, 'Nadzorca', 'Testowy', 'nadzorca@test.pl',
        '$2b$10$up3/tYxTF0KZAbRt.q51A.p7YoILpauboQ0RrdzAPQsZBc/iploXa', 3);

INSERT INTO FRU_USERS (id, first_name, last_name, email, password_hash, role_id)
VALUES (904, 'Pilot', 'Testowy', 'pilot@test.pl',
        '$2b$10$up3/tYxTF0KZAbRt.q51A.p7YoILpauboQ0RrdzAPQsZBc/iploXa', 4);

--------------------------------------------------------
-- Test Helicopters
--------------------------------------------------------
INSERT INTO FRU_HELICOPTERS (id, registration_number, helicopter_type, description,
    max_crew_members, max_crew_weight_kg, status, inspection_valid_until, range_km)
VALUES (901, 'SP-TST1', 'Robinson R44', 'Helikopter testowy 1',
        4, 400, 'active', DATE '2027-12-31', 500);

INSERT INTO FRU_HELICOPTERS (id, registration_number, helicopter_type, description,
    max_crew_members, max_crew_weight_kg, status, inspection_valid_until, range_km)
VALUES (902, 'SP-TST2', 'Bell 407', 'Helikopter testowy 2',
        6, 800, 'inactive', DATE '2025-01-01', 700);

--------------------------------------------------------
-- Test Crew Members
--------------------------------------------------------
INSERT INTO FRU_CREW_MEMBERS (id, first_name, last_name, email, weight_kg, role_id,
    pilot_license_number, license_valid_until, training_valid_until)
VALUES (901, 'Jan', 'Pilotowski', 'jan.pilot@test.pl', 80, 1,
        'PL-PIL-001', DATE '2027-06-30', DATE '2027-06-30');

INSERT INTO FRU_CREW_MEMBERS (id, first_name, last_name, email, weight_kg, role_id,
    pilot_license_number, license_valid_until, training_valid_until)
VALUES (902, 'Anna', 'Obserwator', 'anna.obs@test.pl', 65, 2,
        NULL, NULL, DATE '2027-06-30');

--------------------------------------------------------
-- Test Landing Sites
--------------------------------------------------------
INSERT INTO FRU_LANDING_SITES (id, name, latitude, longitude)
VALUES (901, 'Lotnisko Testowe Alfa', 52.2297700, 21.0117800);

INSERT INTO FRU_LANDING_SITES (id, name, latitude, longitude)
VALUES (902, 'Lotnisko Testowe Bravo', 50.0646500, 19.9449800);

COMMIT;
