package pl.aero.fru.dto.operation;

import pl.aero.fru.dto.dictionary.DictionaryResponse;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public record OperationResponse(
        Long id,
        Long operationNumber,
        String orderProjectNumber,
        String shortDescription,
        LocalDate proposedDateEarliest,
        LocalDate proposedDateLatest,
        Set<DictionaryResponse> activityTypes,
        String additionalInfo,
        Integer routeKm,
        LocalDate plannedDateEarliest,
        LocalDate plannedDateLatest,
        DictionaryResponse status,
        String introducedByEmail,
        String postRealizationNotes,
        List<String> contactPersonEmails,
        List<CommentResponse> comments,
        List<Long> linkedFlightOrderIds,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
