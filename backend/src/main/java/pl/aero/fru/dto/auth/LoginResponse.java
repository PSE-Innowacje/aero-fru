package pl.aero.fru.dto.auth;

public record LoginResponse(String token, String email, String role) {
}
