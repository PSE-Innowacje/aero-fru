package pl.aero.fru.dto.helicopter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record HelicopterResponse(
        Long id,
        String registrationNumber,
        String helicopterType,
        String description,
        Integer maxCrewMembers,
        Integer maxCrewWeightKg,
        String status,
        LocalDate inspectionValidUntil,
        Integer rangeKm,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
