package com.tuitionmanager.web;

import com.tuitionmanager.auth.JwtService;
import com.tuitionmanager.repository.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
    var user = users.findByEmail(request.email()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    if (!user.enabled || !passwordEncoder.matches(request.password(), user.passwordHash)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    return Map.of("token", jwtService.generate(user), "user", Map.of("email", user.email, "fullName", user.fullName, "role", user.role));
  }

  @GetMapping("/me")
  public Map<String, Object> me(Authentication authentication) {
    var user = users.findByEmail(authentication.getName()).orElseThrow();
    return Map.of("email", user.email, "fullName", user.fullName, "role", user.role);
  }

  public record LoginRequest(@Email String email, @NotBlank String password) {}
}
