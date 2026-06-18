package com.tuitionmanager.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuitionmanager.domain.UserAccount;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final String secret;
  private final long expirationMinutes;

  public JwtService(@Value("${app.jwt-secret}") String secret, @Value("${app.jwt-expiration-minutes}") long expirationMinutes) {
    this.secret = secret;
    this.expirationMinutes = expirationMinutes;
  }

  public String generate(UserAccount user) {
    Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("sub", user.email);
    payload.put("name", user.fullName);
    payload.put("role", user.role.name());
    payload.put("exp", Instant.now().plusSeconds(expirationMinutes * 60).getEpochSecond());
    String content = encode(header) + "." + encode(payload);
    return content + "." + sign(content);
  }

  public Map<String, Object> verify(String token) {
    try {
      String[] parts = token.split("\\.");
      if (parts.length != 3) throw new IllegalArgumentException("Invalid token");
      String content = parts[0] + "." + parts[1];
      if (!sign(content).equals(parts[2])) throw new IllegalArgumentException("Invalid signature");
      Map<String, Object> payload = objectMapper.readValue(Base64.getUrlDecoder().decode(parts[1]), new TypeReference<>() {});
      Number exp = (Number) payload.get("exp");
      if (exp == null || Instant.ofEpochSecond(exp.longValue()).isBefore(Instant.now())) throw new IllegalArgumentException("Expired token");
      return payload;
    } catch (Exception ex) {
      throw new IllegalArgumentException("Invalid token", ex);
    }
  }

  private String encode(Object value) {
    try {
      return Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(value));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to encode token", ex);
    }
  }

  private String sign(String content) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to sign token", ex);
    }
  }
}
