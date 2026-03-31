package pl.aero.fru.dto.flightorder;

import java.time.OffsetDateTime;

public record FlightOrderListResponse(
        Long id,
        Long orderNumber,
        OffsetDateTime plannedStartAt,
        String helicopterRegistrationNumber,
        String pilotName,
        String statusName
) {
}
