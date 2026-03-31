package pl.aero.fru.dto.crew;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record CrewMemberResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Integer weightKg,
        String roleName,
        String pilotLicenseNumber,
        LocalDate licenseValidUntil,
        LocalDate trainingValidUntil,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
