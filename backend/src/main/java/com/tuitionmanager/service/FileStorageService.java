package com.tuitionmanager.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
  private final Path uploadDir;

  public FileStorageService(@Value("${app.upload-dir}") String uploadDir) throws IOException {
    this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(this.uploadDir);
  }

  public String store(MultipartFile file) throws IOException {
    String original = file.getOriginalFilename() == null ? "receipt" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
    String fileName = UUID.randomUUID() + "-" + original;
    Path target = uploadDir.resolve(fileName);
    file.transferTo(target);
    return target.toString();
  }
}
