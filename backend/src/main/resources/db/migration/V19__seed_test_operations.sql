-- ============================================================
-- TEST OPERATIONS SEED
-- IDs start at 901 to avoid conflicts with regular data
-- Includes operations in various statuses for testing
-- ============================================================

--------------------------------------------------------
-- Test Operations
--------------------------------------------------------

-- Operation 1: Confirmed (status 3) - visual inspection
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (901, 901, 'PRJ-2026-001', 'Inspekcja linii 400kV Warszawa-Radom',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>21.01,52.23 21.15,51.40</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-04-10', DATE '2026-04-20', 'Priorytetowa inspekcja po burzy', 95.5,
    DATE '2026-04-12', DATE '2026-04-15', 3, 902);

-- Operation 2: Confirmed (status 3) - 3D scan
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (902, 902, 'PRJ-2026-002', 'Skan 3D stacji Grodzisk Mazowiecki',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><Point><coordinates>20.63,52.11</coordinates></Point></Placemark></Document></kml>'),
    DATE '2026-04-15', DATE '2026-04-25', NULL, 12.0,
    DATE '2026-04-18', DATE '2026-04-19', 3, 902);

-- Operation 3: Confirmed (status 3) - patrol
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (903, 903, 'PRJ-2026-003', 'Patrolowanie linii 220kV Kozienice-Siedlce',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>21.55,51.58 22.29,52.17</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-05-01', DATE '2026-05-10', 'Patrol kwartalny Q2', 78.3,
    DATE '2026-05-05', DATE '2026-05-06', 3, 902);

-- Operation 4: Confirmed (status 3) - photos
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (904, 904, 'PRJ-2026-004', 'Dokumentacja fotograficzna slupow Piaseczno',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>20.84,52.07 20.92,52.01</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-04-20', DATE '2026-04-30', NULL, 8.7,
    DATE '2026-04-22', DATE '2026-04-23', 3, 903);

-- Operation 5: Confirmed (status 3) - fault location
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (905, 905, 'PRJ-2026-005', 'Lokalizacja awarii linia 110kV Pruszkow',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>20.80,52.17 20.76,52.19</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-04-05', DATE '2026-04-08', 'Pilne - zgloszenie awarii', 4.2,
    DATE '2026-04-06', DATE '2026-04-06', 3, 903);

-- Operation 6: Introduced (status 1) - awaiting confirmation
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    status_id, introduced_by_user_id)
VALUES (906, 906, 'PRJ-2026-006', 'Inspekcja wizualna linii 400kV Plock-Olsztyn',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>19.72,52.55 20.48,53.78</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-05-15', DATE '2026-05-30', 'Nowa inspekcja - do zatwierdzenia', 142.0,
    1, 902);

-- Operation 7: Introduced (status 1) - awaiting confirmation
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    status_id, introduced_by_user_id)
VALUES (907, 907, 'PRJ-2026-007', 'Skan 3D rozdzielni Zielonka',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><Point><coordinates>21.16,52.30</coordinates></Point></Placemark></Document></kml>'),
    DATE '2026-06-01', DATE '2026-06-10', NULL, 5.0,
    1, 902);

-- Operation 8: Rejected (status 2)
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    status_id, introduced_by_user_id)
VALUES (908, 908, 'PRJ-2026-008', 'Patrolowanie linii 110kV Legionowo',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>20.93,52.40 20.95,52.42</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-04-01', DATE '2026-04-05', 'Odrzucone - brak dostepnosci', 3.1,
    2, 902);

-- Operation 9: Completed (status 6)
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id, post_realization_notes)
VALUES (909, 909, 'PRJ-2026-009', 'Inspekcja wizualna linii 220kV Wolomin',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>21.24,52.35 21.30,52.37</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-03-01', DATE '2026-03-10', NULL, 6.8,
    DATE '2026-03-05', DATE '2026-03-05', 6, 902, 'Inspekcja zakonczona pomyslnie. Brak usterek.');

-- Operation 10: Resigned (status 7)
INSERT INTO FRU_PLANNED_OPERATIONS (id, operation_number, order_project_number, short_description,
    kml_points, proposed_date_earliest, proposed_date_latest, additional_info, route_km,
    planned_date_earliest, planned_date_latest, status_id, introduced_by_user_id)
VALUES (910, 910, 'PRJ-2026-010', 'Zdjecia slupow linii 110kV Nadarzyn',
    UTL_RAW.CAST_TO_RAW('<kml><Document><Placemark><LineString><coordinates>20.82,52.09 20.78,52.06</coordinates></LineString></Placemark></Document></kml>'),
    DATE '2026-03-15', DATE '2026-03-25', 'Rezygnacja z powodu warunkow pogodowych', 4.5,
    DATE '2026-03-20', DATE '2026-03-21', 7, 902);

--------------------------------------------------------
-- Activity Types for Operations (many-to-many)
--------------------------------------------------------

-- Op 901: visual inspection
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (901, 1);

-- Op 902: 3D scan + photos
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (902, 2);
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (902, 4);

-- Op 903: patrol
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (903, 5);

-- Op 904: photos
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (904, 4);

-- Op 905: fault location + visual inspection
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (905, 3);
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (905, 1);

-- Op 906: visual inspection
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (906, 1);

-- Op 907: 3D scan
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (907, 2);

-- Op 908: patrol
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (908, 5);

-- Op 909: visual inspection + photos
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (909, 1);
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (909, 4);

-- Op 910: photos
INSERT INTO FRU_OP_ACTIVITY_TYPES (operation_id, activity_type_id) VALUES (910, 4);

--------------------------------------------------------
-- Contact Persons for selected Operations
--------------------------------------------------------
INSERT INTO FRU_OP_CONTACT_PERSONS (id, operation_id, email) VALUES (901, 901, 'kowalski@pse.pl');
INSERT INTO FRU_OP_CONTACT_PERSONS (id, operation_id, email) VALUES (902, 901, 'nowak@pse.pl');
INSERT INTO FRU_OP_CONTACT_PERSONS (id, operation_id, email) VALUES (903, 903, 'wisniewski@pse.pl');
INSERT INTO FRU_OP_CONTACT_PERSONS (id, operation_id, email) VALUES (904, 905, 'zielinski@pse.pl');
INSERT INTO FRU_OP_CONTACT_PERSONS (id, operation_id, email) VALUES (905, 906, 'kowalski@pse.pl');

COMMIT;
