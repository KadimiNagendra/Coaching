package com.tuitionmanager.web;

import com.tuitionmanager.auth.AccountLookup;
import com.tuitionmanager.auth.JwtService;
import com.tuitionmanager.repository.UserAccountRepository;
import com.tuitionmanager.service.PortalService;
import jakarta.validation.Valid;
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
  private final PortalService portalService;
  private final AccountLookup accountLookup;

  public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder, JwtService jwtService, PortalService portalService, AccountLookup accountLookup) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.portalService = portalService;
    this.accountLookup = accountLookup;
  }

  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
    var user = accountLookup.findByUsername(request.username()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    if (!user.enabled || !passwordEncoder.matches(request.password(), user.passwordHash)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    return Map.of("token", jwtService.generate(user), "user", Map.of(
      "email", user.email,
      "fullName", user.fullName,
      "role", user.role,
      "linkedStudentId", user.linkedStudentId == null ? "" : user.linkedStudentId,
      "linkedParentId", user.linkedParentId == null ? "" : user.linkedParentId
    ));
  }

  @GetMapping("/me")
  public Map<String, Object> me(Authentication authentication) {
    var user = accountLookup.requireUser(authentication);
    return Map.of(
      "email", user.email,
      "fullName", user.fullName,
      "role", user.role,
      "linkedStudentId", user.linkedStudentId == null ? "" : user.linkedStudentId,
      "linkedParentId", user.linkedParentId == null ? "" : user.linkedParentId
    );
  }

  @PostMapping("/reset-credentials")
  public Map<String, Object> resetCredentials(@Valid @RequestBody ResetCredentialsRequest request) {
    portalService.resetCredentials(request);
    return Map.of("success", true, "message", "Credentials updated successfully");
  }

  public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

  public record ResetCredentialsRequest(
    @NotBlank String newUsername,
    @NotBlank String newPassword
  ) {}
}
