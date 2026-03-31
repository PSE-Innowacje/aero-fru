-- V14: Triggers
-- 1. updated_at auto-update on all entity tables
-- 2. Crew member pilot fields validation
-- 3. Planned operations change history tracking

--------------------------------------------------------
-- 1. updated_at triggers
--------------------------------------------------------

CREATE OR REPLACE TRIGGER FRU_TRG_USERS_UPDATED_AT
    BEFORE UPDATE ON FRU_USERS
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER FRU_TRG_HELI_UPDATED_AT
    BEFORE UPDATE ON FRU_HELICOPTERS
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER FRU_TRG_CREW_UPDATED_AT
    BEFORE UPDATE ON FRU_CREW_MEMBERS
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER FRU_TRG_LS_UPDATED_AT
    BEFORE UPDATE ON FRU_LANDING_SITES
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER FRU_TRG_PO_UPDATED_AT
    BEFORE UPDATE ON FRU_PLANNED_OPERATIONS
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER FRU_TRG_FO_UPDATED_AT
    BEFORE UPDATE ON FRU_FLIGHT_ORDERS
    FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

--------------------------------------------------------
-- 2. Crew member pilot fields validation
-- If role = 'Pilot': pilot_license_number and license_valid_until must NOT be NULL.
-- If role != 'Pilot': these fields must be NULL.
--------------------------------------------------------

CREATE OR REPLACE TRIGGER FRU_TRG_CREW_PILOT_VAL
    BEFORE INSERT OR UPDATE ON FRU_CREW_MEMBERS
    FOR EACH ROW
DECLARE
    v_role_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_role_name
    FROM FRU_DICT_CREW_ROLES
    WHERE id = :NEW.role_id;

    IF v_role_name = 'Pilot' THEN
        IF :NEW.pilot_license_number IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001,
                'Pilot license number is required for crew members with role Pilot');
        END IF;
        IF :NEW.license_valid_until IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002,
                'License validity date is required for crew members with role Pilot');
        END IF;
    ELSE
        IF :NEW.pilot_license_number IS NOT NULL THEN
            RAISE_APPLICATION_ERROR(-20003,
                'Pilot license number must be NULL for non-Pilot crew members');
        END IF;
        IF :NEW.license_valid_until IS NOT NULL THEN
            RAISE_APPLICATION_ERROR(-20004,
                'License validity date must be NULL for non-Pilot crew members');
        END IF;
    END IF;
END;
/

--------------------------------------------------------
-- 3. Planned operations change history tracking
-- Compares OLD/NEW for tracked fields and inserts into FRU_OP_CHANGE_HISTORY.
-- Application must set: DBMS_SESSION.SET_CONTEXT('FRU_CTX', 'USER_ID', <id>)
--------------------------------------------------------

CREATE OR REPLACE TRIGGER FRU_TRG_OP_CHANGE_HIST
    AFTER UPDATE ON FRU_PLANNED_OPERATIONS
    FOR EACH ROW
DECLARE
    v_user_id NUMBER;

    PROCEDURE log_change(
        p_field     IN VARCHAR2,
        p_old_value IN VARCHAR2,
        p_new_value IN VARCHAR2
    ) IS
    BEGIN
        IF (p_old_value IS NULL AND p_new_value IS NOT NULL)
           OR (p_old_value IS NOT NULL AND p_new_value IS NULL)
           OR (p_old_value != p_new_value) THEN
            INSERT INTO FRU_OP_CHANGE_HISTORY (
                operation_id, field_name, old_value, new_value,
                changed_by_user_id, changed_at
            ) VALUES (
                :NEW.id, p_field, p_old_value, p_new_value,
                v_user_id, SYSTIMESTAMP
            );
        END IF;
    END log_change;

BEGIN
    v_user_id := TO_NUMBER(SYS_CONTEXT('FRU_CTX', 'USER_ID'));

    log_change('order_project_number',
        :OLD.order_project_number, :NEW.order_project_number);
    log_change('short_description',
        :OLD.short_description, :NEW.short_description);
    log_change('proposed_date_earliest',
        TO_CHAR(:OLD.proposed_date_earliest, 'YYYY-MM-DD'),
        TO_CHAR(:NEW.proposed_date_earliest, 'YYYY-MM-DD'));
    log_change('proposed_date_latest',
        TO_CHAR(:OLD.proposed_date_latest, 'YYYY-MM-DD'),
        TO_CHAR(:NEW.proposed_date_latest, 'YYYY-MM-DD'));
    log_change('additional_info',
        :OLD.additional_info, :NEW.additional_info);
    log_change('route_km',
        TO_CHAR(:OLD.route_km), TO_CHAR(:NEW.route_km));
    log_change('planned_date_earliest',
        TO_CHAR(:OLD.planned_date_earliest, 'YYYY-MM-DD'),
        TO_CHAR(:NEW.planned_date_earliest, 'YYYY-MM-DD'));
    log_change('planned_date_latest',
        TO_CHAR(:OLD.planned_date_latest, 'YYYY-MM-DD'),
        TO_CHAR(:NEW.planned_date_latest, 'YYYY-MM-DD'));
    log_change('status_id',
        TO_CHAR(:OLD.status_id), TO_CHAR(:NEW.status_id));
    log_change('post_realization_notes',
        :OLD.post_realization_notes, :NEW.post_realization_notes);
END;
/
