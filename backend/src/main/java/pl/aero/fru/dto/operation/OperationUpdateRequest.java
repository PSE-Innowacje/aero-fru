package pl.aero.fru.dto.operation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record OperationUpdateRequest(
        @NotBlank @Size(max = 30) String orderProjectNumber,
        @NotBlank @Size(max = 100) String shortDescription,
        LocalDate proposedDateEarliest,
        LocalDate proposedDateLatest,
        @NotEmpty Set<Long> activityTypeIds,
        @Size(max = 500) String additionalInfo,
        List<String> contactPersonEmails,
        // Supervisor-only fields
        LocalDate plannedDateEarliest,
        LocalDate plannedDateLatest,
        @Size(max = 500) String postRealizationNotes
) {
}
