package pl.aero.fru.dto.crew;

import java.time.LocalDate;

public record CrewMemberListResponse(
        Long id,
        String email,
        String roleName,
        LocalDate licenseValidUntil,
        LocalDate trainingValidUntil
) {
}
