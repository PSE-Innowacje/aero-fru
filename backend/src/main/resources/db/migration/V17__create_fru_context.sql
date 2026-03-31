-- V17: Create Oracle application context namespace for change history trigger
-- The trigger FRU_TRG_OP_CHANGE_HIST (V14) reads SYS_CONTEXT('FRU_CTX', 'USER_ID')
-- This migration creates the context namespace and a helper package to set it.

CREATE OR REPLACE PACKAGE FRU_CTX_PKG AS
    PROCEDURE set_user_id(p_user_id IN NUMBER);
END FRU_CTX_PKG;
/

CREATE OR REPLACE CONTEXT FRU_CTX USING FRU_CTX_PKG;

CREATE OR REPLACE PACKAGE BODY FRU_CTX_PKG AS
    PROCEDURE set_user_id(p_user_id IN NUMBER) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('FRU_CTX', 'USER_ID', TO_CHAR(p_user_id));
    END set_user_id;
END FRU_CTX_PKG;
/
