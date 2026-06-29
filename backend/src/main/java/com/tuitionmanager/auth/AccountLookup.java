package com.tuitionmanager.auth;

import com.tuitionmanager.domain.UserAccount;
import com.tuitionmanager.repository.UserAccountRepository;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AccountLookup {
  private final UserAccountRepository users;

  public AccountLookup(UserAccountRepository users) {
    this.users = users;
  }

  public UserAccount requireUser(Authentication authentication) {
    if (authentication == null || authentication.getName() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }
    return findByPrincipal(authentication.getName())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }

  public Optional<UserAccount> findByUsername(String username) {
    if (username == null || username.isBlank()) {
      return Optional.empty();
    }
    return users.findByEmail(username).or(() -> users.findByEmailIgnoreCase(username));
  }

  public Optional<UserAccount> findByPrincipal(String principal) {
    if (principal == null || principal.isBlank()) {
      return Optional.empty();
    }
    if (principal.matches("\\d+")) {
      return users.findById(Long.parseLong(principal));
    }
    return findByUsername(principal);
  }
}
