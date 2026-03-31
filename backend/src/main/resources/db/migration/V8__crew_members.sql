-- V8: Crew members table
-- Helicopter crew with pilot-specific fields validated by trigger (V14)

CREATE SEQUENCE FRU_CREW_MEMBERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE FRU_CREW_MEMBERS (
    id                     NUMBER               DEFAULT FRU_CREW_MEMBERS_SEQ.NEXTVAL NOT NULL,
    first_name             VARCHAR2(100)        NOT NULL,
    last_name              VARCHAR2(100)        NOT NULL,
    email                  VARCHAR2(100)        NOT NULL,
    weight_kg              NUMBER               NOT NULL,
    role_id                NUMBER               NOT NULL,
    pilot_license_number   VARCHAR2(30),
    license_valid_until    DATE,
    training_valid_until   DATE                 NOT NULL,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_CREW_MEMBERS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_CREW_EMAIL_UK UNIQUE (email),
    CONSTRAINT FRU_CREW_ROLE_FK FOREIGN KEY (role_id)
        REFERENCES FRU_DICT_CREW_ROLES (id),
    CONSTRAINT FRU_CREW_WEIGHT_CHK CHECK (weight_kg BETWEEN 30 AND 200),
    CONSTRAINT FRU_CREW_EMAIL_CHK CHECK (
        REGEXP_LIKE(email, '^[a-zA-Z0-9.\-]+@[a-zA-Z]+(\.[a-zA-Z]+)+$')
    )
);
