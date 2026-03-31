-- V10: Planned operations table + junction tables
-- (operation_activity_types, operation_contact_persons)

--------------------------------------------------------
-- Sequences
--------------------------------------------------------
CREATE SEQUENCE FRU_PLANNED_OPS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FRU_PLANNED_OPS_NUM_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FRU_OP_CONTACT_PERSONS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

--------------------------------------------------------
-- FRU_PLANNED_OPERATIONS
--------------------------------------------------------
CREATE TABLE FRU_PLANNED_OPERATIONS (
    id                      NUMBER               DEFAULT FRU_PLANNED_OPS_SEQ.NEXTVAL NOT NULL,
    operation_number        NUMBER               DEFAULT FRU_PLANNED_OPS_NUM_SEQ.NEXTVAL NOT NULL,
    order_project_number    VARCHAR2(30)         NOT NULL,
    short_description       VARCHAR2(100)        NOT NULL,
    kml_points              BLOB                 NOT NULL,
    proposed_date_earliest  DATE,
    proposed_date_latest    DATE,
    additional_info         VARCHAR2(500),
    route_km                NUMBER               NOT NULL,
    planned_date_earliest   DATE,
    planned_date_latest     DATE,
    status_id               NUMBER               DEFAULT 1 NOT NULL,
    introduced_by_user_id   NUMBER               NOT NULL,
    post_realization_notes  VARCHAR2(500),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_PLANNED_OPS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_PLANNED_OPS_NUM_UK UNIQUE (operation_number),
    CONSTRAINT FRU_PO_STATUS_FK FOREIGN KEY (status_id)
        REFERENCES FRU_DICT_OPERATION_STATUSES (id),
    CONSTRAINT FRU_PO_USER_FK FOREIGN KEY (introduced_by_user_id)
        REFERENCES FRU_USERS (id),
    CONSTRAINT FRU_PO_PROPOSED_DATE_CHK CHECK (
        proposed_date_earliest IS NULL
        OR proposed_date_latest IS NULL
        OR proposed_date_earliest <= proposed_date_latest
    ),
    CONSTRAINT FRU_PO_PLANNED_DATE_CHK CHECK (
        planned_date_earliest IS NULL
        OR planned_date_latest IS NULL
        OR planned_date_earliest <= planned_date_latest
    )
);

--------------------------------------------------------
-- FRU_OP_ACTIVITY_TYPES (many-to-many)
--------------------------------------------------------
CREATE TABLE FRU_OP_ACTIVITY_TYPES (
    operation_id     NUMBER NOT NULL,
    activity_type_id NUMBER NOT NULL,
    CONSTRAINT FRU_OP_ACT_TYPES_PK PRIMARY KEY (operation_id, activity_type_id),
    CONSTRAINT FRU_OAT_OP_FK FOREIGN KEY (operation_id)
        REFERENCES FRU_PLANNED_OPERATIONS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_OAT_AT_FK FOREIGN KEY (activity_type_id)
        REFERENCES FRU_DICT_ACTIVITY_TYPES (id)
);

--------------------------------------------------------
-- FRU_OP_CONTACT_PERSONS
--------------------------------------------------------
CREATE TABLE FRU_OP_CONTACT_PERSONS (
    id           NUMBER        DEFAULT FRU_OP_CONTACT_PERSONS_SEQ.NEXTVAL NOT NULL,
    operation_id NUMBER        NOT NULL,
    email        VARCHAR2(100) NOT NULL,
    CONSTRAINT FRU_OP_CONTACTS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_OCP_OP_FK FOREIGN KEY (operation_id)
        REFERENCES FRU_PLANNED_OPERATIONS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_OCP_EMAIL_CHK CHECK (
        REGEXP_LIKE(email, '^[a-zA-Z0-9.\-]+@[a-zA-Z]+(\.[a-zA-Z]+)+$')
    )
);
