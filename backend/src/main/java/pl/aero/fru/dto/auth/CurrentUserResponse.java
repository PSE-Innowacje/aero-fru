package pl.aero.fru.dto.auth;

public record CurrentUserResponse(Long id, String firstName, String lastName, String email, String role) {
}
