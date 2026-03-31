package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import pl.aero.fru.dto.auth.CurrentUserResponse;
import pl.aero.fru.dto.auth.LoginRequest;
import pl.aero.fru.dto.auth.LoginResponse;
import pl.aero.fru.entity.User;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.repository.UserRepository;
import pl.aero.fru.security.JwtTokenProvider;
import pl.aero.fru.security.UserPrincipal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        return new LoginResponse(token, principal.getEmail(), principal.getRoleName());
    }

    public CurrentUserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));
        return new CurrentUserResponse(
                user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().getName());
    }
}
