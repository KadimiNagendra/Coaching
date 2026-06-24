package com.tuitionmanager.web;

import com.tuitionmanager.service.PortalService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/v1/portal")
public class PortalController {
  private final PortalService portalService;

  public PortalController(PortalService portalService) {
    this.portalService = portalService;
  }

  @GetMapping("/overview") public Map<String, Object> overview() { return portalService.overview(); }
  @GetMapping("/fees") public Object fees() { return portalService.fees(); }
  @GetMapping("/attendance") public Object attendance() { return portalService.attendance(); }
  @GetMapping("/exams") public Object exams() { return portalService.exams(); }
  @GetMapping("/results") public Object results() { return portalService.results(); }
  @GetMapping("/homework") public Object homework() { return portalService.homework(); }
  @GetMapping("/notifications") public Object notifications() { return portalService.notifications(); }

  @PostMapping("/reset-credentials")
  public Map<String, Object> resetCredentials(@Valid @RequestBody ResetCredentialsRequest request) {
    portalService.resetCredentials(request);
    return Map.of("success", true, "message", "Credentials updated successfully");
  }

  public record ResetCredentialsRequest(
    @Email @NotBlank String newUsername,
    @NotBlank String newPassword
  ) {}
}
