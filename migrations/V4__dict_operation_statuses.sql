-- V4: Dictionary table for planned operation statuses
-- IDs match PRD status codes (1-7)

CREATE TABLE FRU_DICT_OPERATION_STATUSES (
    id   NUMBER        NOT NULL,
    name VARCHAR2(100) NOT NULL,
    CONSTRAINT FRU_DICT_OP_STAT_PK PRIMARY KEY (id),
    CONSTRAINT FRU_DICT_OP_STAT_UK UNIQUE (name)
);
