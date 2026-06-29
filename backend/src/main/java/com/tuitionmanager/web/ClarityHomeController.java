package com.tuitionmanager.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuitionmanager.domain.ClarityHomeData;
import com.tuitionmanager.repository.ClarityHomeDataRepository;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/clarity-home")
public class ClarityHomeController {
  private final ClarityHomeDataRepository repository;

  public ClarityHomeController(ClarityHomeDataRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public Map<String, Object> getData(Authentication authentication) throws Exception {
    if (authentication == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    String json = repository.findById(authentication.getName())
        .map(data -> data.jsonData)
        .orElse("{}");
    return new ObjectMapper().readValue(json, new TypeReference<Map<String, Object>>() {});
  }

  @PostMapping
  public void saveData(Authentication authentication, @RequestBody Map<String, Object> payload) throws Exception {
    if (authentication == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    ClarityHomeData entity = new ClarityHomeData();
    entity.email = authentication.getName();
    entity.jsonData = new ObjectMapper().writeValueAsString(payload);
    repository.save(entity);
  }
}
