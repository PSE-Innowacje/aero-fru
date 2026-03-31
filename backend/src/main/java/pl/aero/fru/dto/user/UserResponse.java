package pl.aero.fru.dto.user;

import java.time.OffsetDateTime;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String roleName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
