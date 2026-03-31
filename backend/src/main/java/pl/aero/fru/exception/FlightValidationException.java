package pl.aero.fru.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class FlightValidationException extends RuntimeException {

    private final List<String> violations;

    public FlightValidationException(List<String> violations) {
        super("Walidacja zlecenia lotu nie powiodła się: " + String.join("; ", violations));
        this.violations = violations;
    }
}
