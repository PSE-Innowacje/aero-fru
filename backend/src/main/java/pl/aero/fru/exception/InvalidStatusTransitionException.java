package pl.aero.fru.exception;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(Long fromStatusId, Long toStatusId) {
        super("Invalid status transition from " + fromStatusId + " to " + toStatusId);
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
