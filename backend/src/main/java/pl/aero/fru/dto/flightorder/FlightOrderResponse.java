package pl.aero.fru.dto.flightorder;

import pl.aero.fru.dto.dictionary.DictionaryResponse;

import java.time.OffsetDateTime;
import java.util.Set;

public record FlightOrderResponse(
        Long id,
        Long orderNumber,
        OffsetDateTime plannedStartAt,
        OffsetDateTime plannedLandingAt,
        CrewMemberSummary pilot,
        DictionaryResponse status,
        HelicopterSummary helicopter,
        Integer crewWeightKg,
        LandingSiteSummary startLandingSite,
        LandingSiteSummary endLandingSite,
        Set<CrewMemberSummary> crewMembers,
        Set<OperationSummary> operations,
        Integer estimatedRouteKm,
        OffsetDateTime actualStartAt,
        OffsetDateTime actualLandingAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record CrewMemberSummary(Long id, String firstName, String lastName) {}
    public record HelicopterSummary(Long id, String registrationNumber, String helicopterType) {}
    public record LandingSiteSummary(Long id, String name) {}
    public record OperationSummary(Long id, Long operationNumber, String shortDescription) {}
}
