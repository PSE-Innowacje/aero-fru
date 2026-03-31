-- V5: Dictionary table for flight order statuses
-- IDs match PRD status codes (1-7)

CREATE TABLE FRU_DICT_FLIGHT_ORDER_STATUSES (
    id   NUMBER        NOT NULL,
    name VARCHAR2(100) NOT NULL,
    CONSTRAINT FRU_DICT_FO_STAT_PK PRIMARY KEY (id),
    CONSTRAINT FRU_DICT_FO_STAT_UK UNIQUE (name)
);
