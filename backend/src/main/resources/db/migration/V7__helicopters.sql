-- V7: Helicopters table
-- Fleet registry with operational constraints

CREATE SEQUENCE FRU_HELICOPTERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE FRU_HELICOPTERS (
    id                      NUMBER               DEFAULT FRU_HELICOPTERS_SEQ.NEXTVAL NOT NULL,
    registration_number     VARCHAR2(30)         NOT NULL,
    helicopter_type         VARCHAR2(100)        NOT NULL,
    description             VARCHAR2(100),
    max_crew_members        NUMBER               NOT NULL,
    max_crew_weight_kg      NUMBER               NOT NULL,
    status                  VARCHAR2(10)         NOT NULL,
    inspection_valid_until  DATE,
    range_km                NUMBER               NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_HELICOPTERS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_HELICOPTERS_REG_UK UNIQUE (registration_number),
    CONSTRAINT FRU_HELI_STATUS_CHK CHECK (status IN ('active', 'inactive')),
    CONSTRAINT FRU_HELI_CREW_CHK CHECK (max_crew_members BETWEEN 1 AND 10),
    CONSTRAINT FRU_HELI_WEIGHT_CHK CHECK (max_crew_weight_kg BETWEEN 1 AND 1000),
    CONSTRAINT FRU_HELI_RANGE_CHK CHECK (range_km BETWEEN 1 AND 1000),
    CONSTRAINT FRU_HELI_INSPECT_CHK CHECK (
        status = 'inactive' OR inspection_valid_until IS NOT NULL
    )
);
