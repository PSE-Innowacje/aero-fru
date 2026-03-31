package pl.aero.fru.dto.operation;

import java.time.LocalDate;
import java.util.Set;

public record OperationListResponse(
        Long id,
        Long operationNumber,
        String orderProjectNumber,
        Set<String> activityTypeNames,
        LocalDate proposedDateEarliest,
        LocalDate proposedDateLatest,
        LocalDate plannedDateEarliest,
        LocalDate plannedDateLatest,
        String statusName
) {
}
