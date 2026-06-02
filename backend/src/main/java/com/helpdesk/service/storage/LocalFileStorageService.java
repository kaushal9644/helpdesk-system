package com.helpdesk.service.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.helpdesk.config.StorageProperties;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    private final StorageProperties storageProperties;

    @Override
    public StoredFile store(MultipartFile file, String ticketFolderName) {
        try {
            Path uploadRoot = Path.of(storageProperties.getUploadDir())
                    .toAbsolutePath()
                    .normalize();

            Path ticketFolder = uploadRoot.resolve(ticketFolderName);
            Files.createDirectories(ticketFolder);

            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "-" + originalFileName;

            Path destination = ticketFolder.resolve(storedFileName).normalize();

            file.transferTo(destination.toFile());

            return StoredFile.builder()
                    .storedFileName(storedFileName)
                    .originalFileName(originalFileName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .absolutePath(destination)
                    .relativePath(ticketFolderName + "/" + storedFileName)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void delete(Path absolutePath) {
        try {
            Files.deleteIfExists(absolutePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }
}