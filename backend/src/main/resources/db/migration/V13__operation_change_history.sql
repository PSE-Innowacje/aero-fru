-- V13: Operation change history table
-- Field-level audit log for planned operations

CREATE SEQUENCE FRU_OP_CHANGE_HIST_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE FRU_OP_CHANGE_HISTORY (
    id                 NUMBER               DEFAULT FRU_OP_CHANGE_HIST_SEQ.NEXTVAL NOT NULL,
    operation_id       NUMBER               NOT NULL,
    field_name         VARCHAR2(100)        NOT NULL,
    old_value          VARCHAR2(4000),
    new_value          VARCHAR2(4000),
    changed_by_user_id NUMBER               NOT NULL,
    changed_at         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_OP_CHANGE_HIST_PK PRIMARY KEY (id),
    CONSTRAINT FRU_OCH_OP_FK FOREIGN KEY (operation_id)
        REFERENCES FRU_PLANNED_OPERATIONS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_OCH_USER_FK FOREIGN KEY (changed_by_user_id)
        REFERENCES FRU_USERS (id)
);
