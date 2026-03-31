package pl.aero.fru.dto.crew;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CrewMemberRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Size(max = 100) @Email String email,
        @NotNull @Min(30) @Max(200) Integer weightKg,
        @NotNull Long roleId,
        @Size(max = 30) String pilotLicenseNumber,
        LocalDate licenseValidUntil,
        @NotNull LocalDate trainingValidUntil
) {
}
