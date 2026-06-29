package com.tuitionmanager.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuitionmanager.auth.AccountLookup;
import com.tuitionmanager.domain.ClarityHomeData;
import com.tuitionmanager.domain.Role;
import com.tuitionmanager.domain.UserAccount;
import com.tuitionmanager.repository.ClarityHomeDataRepository;
import com.tuitionmanager.repository.UserAccountRepository;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/clarity-home")
public class ClarityHomeController {
  private final ClarityHomeDataRepository repository;
  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final AccountLookup accountLookup;

  public ClarityHomeController(ClarityHomeDataRepository repository, UserAccountRepository users, PasswordEncoder passwordEncoder, AccountLookup accountLookup) {
    this.repository = repository;
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.accountLookup = accountLookup;
  }

  private String getTargetEmail(Authentication authentication) {
    if (authentication == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    return accountLookup.findByPrincipal(authentication.getName())
        .map(u -> u.role == Role.FAMILY_MEMBER ? u.linkedAdminEmail : u.email)
        .orElse(authentication.getName());
  }

  private Map<String, Object> provisionFamilyMembers(String targetEmail, Map<String, Object> payload) throws Exception {
    Object membersObj = payload.get("ch_family_members");
    if (membersObj instanceof java.util.List) {
      java.util.List<Map<String, Object>> members = (java.util.List<Map<String, Object>>) membersObj;
      boolean modified = false;
      
      for (Object item : members) {
        if (item instanceof Map) {
          Map<String, Object> member = (Map<String, Object>) item;
          String name = (String) member.get("name");
          if (name != null && !name.trim().isEmpty() && !"Self".equalsIgnoreCase(name)) {
            String username = (String) member.get("username");
            if (username == null || username.trim().isEmpty()) {
              // Generate credentials
              String prefix = targetEmail.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
              String cleanName = name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
              String genUsername = "fam_" + cleanName + "_" + prefix;
              
              // Ensure unique username
              int suffix = 1;
              String candidate = genUsername;
              while (users.findByEmail(candidate).isPresent()) {
                candidate = "fam_" + cleanName + suffix + "_" + prefix;
                suffix++;
              }
              genUsername = candidate;
              String genPassword = "Welcome@123";
              
              // Create UserAccount
              UserAccount newAcc = new UserAccount();
              newAcc.email = genUsername;
              newAcc.passwordHash = passwordEncoder.encode(genPassword);
              newAcc.fullName = name;
              newAcc.role = Role.FAMILY_MEMBER;
              newAcc.linkedAdminEmail = targetEmail;
              users.save(newAcc);
              
              // Put generated credentials into JSON
              member.put("username", genUsername);
              member.put("password", genPassword);
              modified = true;
            }
          }
        }
      }
      
      // Clean up deleted family member accounts
      java.util.Set<String> activeUsernames = new java.util.HashSet<>();
      for (Object item : members) {
        if (item instanceof Map) {
          String uname = (String) ((Map<?, ?>) item).get("username");
          if (uname != null) {
            activeUsernames.add(uname);
          }
        }
      }
      users.findByLinkedAdminEmailAndRole(targetEmail, Role.FAMILY_MEMBER).forEach(acc -> {
        if (!activeUsernames.contains(acc.email)) {
          users.delete(acc);
        }
      });
      
      if (modified) {
        ClarityHomeData entity = new ClarityHomeData();
        entity.email = targetEmail;
        entity.jsonData = new ObjectMapper().writeValueAsString(payload);
        repository.save(entity);
      }
    }
    return payload;
  }

  @GetMapping
  public Map<String, Object> getData(Authentication authentication) throws Exception {
    String targetEmail = getTargetEmail(authentication);
    String json = repository.findById(targetEmail)
        .map(data -> data.jsonData)
        .orElse("{}");
    Map<String, Object> payload = new ObjectMapper().readValue(json, new TypeReference<Map<String, Object>>() {});
    return provisionFamilyMembers(targetEmail, payload);
  }

  @PostMapping
  public Map<String, Object> saveData(Authentication authentication, @RequestBody Map<String, Object> payload) throws Exception {
    String targetEmail = getTargetEmail(authentication);
    Map<String, Object> updatedPayload = provisionFamilyMembers(targetEmail, payload);
    ClarityHomeData entity = new ClarityHomeData();
    entity.email = targetEmail;
    entity.jsonData = new ObjectMapper().writeValueAsString(updatedPayload);
    repository.save(entity);
    return updatedPayload;
  }
}
