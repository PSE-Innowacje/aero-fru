package pl.aero.fru.dto.helicopter;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record HelicopterRequest(
        @NotBlank @Size(max = 30) String registrationNumber,
        @NotBlank @Size(max = 100) String helicopterType,
        @Size(max = 100) String description,
        @NotNull @Min(1) @Max(10) Integer maxCrewMembers,
        @NotNull @Min(1) @Max(1000) Integer maxCrewWeightKg,
        @NotBlank @Pattern(regexp = "^(active|inactive)$") String status,
        LocalDate inspectionValidUntil,
        @NotNull @Min(1) @Max(1000) Integer rangeKm
) {
}
