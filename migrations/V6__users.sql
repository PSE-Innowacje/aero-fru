-- V6: Users table
-- Application users with role-based access control

CREATE SEQUENCE FRU_USERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE FRU_USERS (
    id            NUMBER               DEFAULT FRU_USERS_SEQ.NEXTVAL NOT NULL,
    first_name    VARCHAR2(100)        NOT NULL,
    last_name     VARCHAR2(100)        NOT NULL,
    email         VARCHAR2(100)        NOT NULL,
    password_hash VARCHAR2(255)        NOT NULL,
    role_id       NUMBER               NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT FRU_USERS_PK PRIMARY KEY (id),
    CONSTRAINT FRU_USERS_EMAIL_UK UNIQUE (email),
    CONSTRAINT FRU_USERS_ROLE_FK FOREIGN KEY (role_id)
        REFERENCES FRU_DICT_USER_ROLES (id),
    CONSTRAINT FRU_USERS_EMAIL_CHK CHECK (
        REGEXP_LIKE(email, '^[a-zA-Z0-9.\-]+@[a-zA-Z]+(\.[a-zA-Z]+)+$')
    )
);
