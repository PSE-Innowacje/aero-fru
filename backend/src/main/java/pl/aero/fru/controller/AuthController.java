package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.aero.fru.dto.auth.CurrentUserResponse;
import pl.aero.fru.dto.auth.LoginRequest;
import pl.aero.fru.dto.auth.LoginResponse;
import pl.aero.fru.security.UserPrincipal;
import pl.aero.fru.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal));
    }
}
