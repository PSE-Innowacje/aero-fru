package pl.aero.fru.dto.flightorder;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.Set;

public record FlightOrderUpdateRequest(
        @NotNull OffsetDateTime plannedStartAt,
        @NotNull OffsetDateTime plannedLandingAt,
        @NotNull Long pilotId,
        @NotNull Long helicopterId,
        Set<Long> crewMemberIds,
        @NotNull Long startLandingSiteId,
        @NotNull Long endLandingSiteId,
        @NotEmpty Set<Long> operationIds,
        @NotNull Integer estimatedRouteKm,
        OffsetDateTime actualStartAt,
        OffsetDateTime actualLandingAt
) {
}
