-- V11: Flight orders table + junction tables
-- (flight_order_crew_members, flight_order_operations)

--------------------------------------------------------
-- Sequences
--------------------------------------------------------
CREATE SEQUENCE FRU_FLIGHT_ORDERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FRU_FLIGHT_ORDERS_NUM_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

--------------------------------------------------------
-- FRU_FLIGHT_ORDERS
--------------------------------------------------------
CREATE TABLE FRU_FLIGHT_ORDERS (
    id                     NUMBER               DEFAULT FRU_FLIGHT_ORDERS_SEQ.NEXTVAL NOT NULL,
    order_number           NUMBER               DEFAULT FRU_FLIGHT_ORDERS_NUM_SEQ.NEXTVAL NOT NULL,
    planned_start_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_landing_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    pilot_id               NUMBER               NOT NULL,
    status_id              NUMBER               DEFAULT 1 NOT NULL,
    helicopter_id          NUMBER               NOT NULL,
    crew_weight_kg         NUMBER               NOT NULL,
    start_landing_site_id  NUMBER               NOT NULL,
    end_landing_site_id    NUMBER               NOT NULL,
    estimated_route_km     NUMBER               NOT NULL,
    actual_start_at        TIMESTAMP WITH TIME ZONE,
    actual_landing_at      TIMESTAMP WITH TIME ZONE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_FLIGHT_ORDERS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_FO_NUM_UK UNIQUE (order_number),
    CONSTRAINT FRU_FO_PILOT_FK FOREIGN KEY (pilot_id)
        REFERENCES FRU_CREW_MEMBERS (id),
    CONSTRAINT FRU_FO_STATUS_FK FOREIGN KEY (status_id)
        REFERENCES FRU_DICT_FLIGHT_ORDER_STATUSES (id),
    CONSTRAINT FRU_FO_HELI_FK FOREIGN KEY (helicopter_id)
        REFERENCES FRU_HELICOPTERS (id),
    CONSTRAINT FRU_FO_START_LS_FK FOREIGN KEY (start_landing_site_id)
        REFERENCES FRU_LANDING_SITES (id),
    CONSTRAINT FRU_FO_END_LS_FK FOREIGN KEY (end_landing_site_id)
        REFERENCES FRU_LANDING_SITES (id),
    CONSTRAINT FRU_FO_PLANNED_TIME_CHK CHECK (
        planned_start_at < planned_landing_at
    ),
    CONSTRAINT FRU_FO_ACTUAL_TIME_CHK CHECK (
        actual_start_at IS NULL
        OR actual_landing_at IS NULL
        OR actual_start_at < actual_landing_at
    )
);

--------------------------------------------------------
-- FRU_FO_CREW_MEMBERS (many-to-many)
--------------------------------------------------------
CREATE TABLE FRU_FO_CREW_MEMBERS (
    flight_order_id NUMBER NOT NULL,
    crew_member_id  NUMBER NOT NULL,
    CONSTRAINT FRU_FO_CREW_PK PRIMARY KEY (flight_order_id, crew_member_id),
    CONSTRAINT FRU_FOCM_FO_FK FOREIGN KEY (flight_order_id)
        REFERENCES FRU_FLIGHT_ORDERS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_FOCM_CM_FK FOREIGN KEY (crew_member_id)
        REFERENCES FRU_CREW_MEMBERS (id)
);

--------------------------------------------------------
-- FRU_FO_OPERATIONS (many-to-many)
--------------------------------------------------------
CREATE TABLE FRU_FO_OPERATIONS (
    flight_order_id NUMBER NOT NULL,
    operation_id    NUMBER NOT NULL,
    CONSTRAINT FRU_FO_OPS_PK PRIMARY KEY (flight_order_id, operation_id),
    CONSTRAINT FRU_FOO_FO_FK FOREIGN KEY (flight_order_id)
        REFERENCES FRU_FLIGHT_ORDERS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_FOO_OP_FK FOREIGN KEY (operation_id)
        REFERENCES FRU_PLANNED_OPERATIONS (id)
);
