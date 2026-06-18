package com.tuitionmanager.service;

import com.tuitionmanager.domain.AuditLog;
import com.tuitionmanager.repository.AuditLogRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private final AuditLogRepository repository;

  public AuditService(AuditLogRepository repository) {
    this.repository = repository;
  }

  public void record(String action, String entityType, Long entityId, String details) {
    AuditLog log = new AuditLog();
    log.actor = SecurityContextHolder.getContext().getAuthentication() == null ? "system" : SecurityContextHolder.getContext().getAuthentication().getName();
    log.action = action;
    log.entityType = entityType;
    log.entityId = entityId;
    log.details = details;
    repository.save(log);
  }
}
