package pl.aero.fru.dto.operation;

import java.time.OffsetDateTime;

public record ChangeHistoryResponse(
        Long id,
        String fieldName,
        String oldValue,
        String newValue,
        String changedByEmail,
        OffsetDateTime changedAt
) {
}
