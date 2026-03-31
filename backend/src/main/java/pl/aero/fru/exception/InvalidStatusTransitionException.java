package pl.aero.fru.exception;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(Long fromStatusId, Long toStatusId) {
        super("Niedozwolona zmiana statusu z " + fromStatusId + " na " + toStatusId);
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
