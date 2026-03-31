package pl.aero.fru.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pl.aero.fru.security.JwtAuthenticationEntryPoint;
import pl.aero.fru.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()

                        // Administration write endpoints — Administrator only
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.POST, "/api/helicopters/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.PUT, "/api/helicopters/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.POST, "/api/crew-members/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.PUT, "/api/crew-members/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.POST, "/api/landing-sites/**").hasRole("Administrator")
                        .requestMatchers(HttpMethod.PUT, "/api/landing-sites/**").hasRole("Administrator")

                        // All other endpoints require authentication (fine-grained via @PreAuthorize)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
