package pl.aero.fru.dto.landingsite;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record LandingSiteResponse(
        Long id,
        String name,
        BigDecimal latitude,
        BigDecimal longitude,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
