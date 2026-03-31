package pl.aero.fru.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class FlightValidationException extends RuntimeException {

    private final List<String> violations;

    public FlightValidationException(List<String> violations) {
        super("Flight order validation failed: " + String.join("; ", violations));
        this.violations = violations;
    }
}
