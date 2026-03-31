package pl.aero.fru.dto.user;

public record UserListResponse(
        Long id,
        String email,
        String roleName
) {
}
