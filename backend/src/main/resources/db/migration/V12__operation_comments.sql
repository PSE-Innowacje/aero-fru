-- V12: Operation comments table
-- Append-only comment list per planned operation

CREATE SEQUENCE FRU_OP_COMMENTS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE FRU_OP_COMMENTS (
    id                 NUMBER               DEFAULT FRU_OP_COMMENTS_SEQ.NEXTVAL NOT NULL,
    operation_id       NUMBER               NOT NULL,
    comment_text       VARCHAR2(500)        NOT NULL,
    created_by_user_id NUMBER               NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_OP_COMMENTS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_OPC_OP_FK FOREIGN KEY (operation_id)
        REFERENCES FRU_PLANNED_OPERATIONS (id) ON DELETE CASCADE,
    CONSTRAINT FRU_OPC_USER_FK FOREIGN KEY (created_by_user_id)
        REFERENCES FRU_USERS (id)
);
