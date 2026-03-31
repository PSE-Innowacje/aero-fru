package pl.aero.fru.dto.helicopter;

public record HelicopterListResponse(
        Long id,
        String registrationNumber,
        String helicopterType,
        String status
) {
}
