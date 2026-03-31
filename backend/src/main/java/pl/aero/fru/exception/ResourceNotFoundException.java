package pl.aero.fru.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " nie znaleziono z id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
