-- V15: Additional indexes for common query patterns
-- (PK and UNIQUE indexes are created automatically)

-- Helicopters: default list view sort (status, registration_number)
CREATE INDEX FRU_IDX_HELI_STATUS_REG
    ON FRU_HELICOPTERS (status, registration_number);

-- Planned operations: default list view (filter status=3, sort by planned_date_earliest)
CREATE INDEX FRU_IDX_PO_STATUS_DATE
    ON FRU_PLANNED_OPERATIONS (status_id, planned_date_earliest);

-- Flight orders: default list view (filter status=2, sort by planned_start_at)
CREATE INDEX FRU_IDX_FO_STATUS_START
    ON FRU_FLIGHT_ORDERS (status_id, planned_start_at);

-- Operation comments: chronological listing per operation
CREATE INDEX FRU_IDX_OPC_OP_DATE
    ON FRU_OP_COMMENTS (operation_id, created_at);

-- Operation change history: chronological listing per operation
CREATE INDEX FRU_IDX_OCH_OP_DATE
    ON FRU_OP_CHANGE_HISTORY (operation_id, changed_at);

-- Flight order operations: reverse lookup (which orders reference an operation)
CREATE INDEX FRU_IDX_FOO_OP
    ON FRU_FO_OPERATIONS (operation_id);
