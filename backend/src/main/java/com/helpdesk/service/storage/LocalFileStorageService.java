package com.helpdesk.service.storage;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    @Override
    public StoredFile store(MultipartFile file, String ticketFolderName) {
        try {
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "-" + originalFileName;

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "helpdesk/" + ticketFolderName,
                            "public_id", storedFileName,
                            "resource_type", "auto"
                    )
            );

            String secureUrl = uploadResult.get("secure_url").toString();

            return StoredFile.builder()
                    .storedFileName(storedFileName)
                    .originalFileName(originalFileName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .absolutePath(null)
                    .relativePath(secureUrl)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    @Override
    public void delete(Path absolutePath) {
        // Cloudinary delete can be added later using public_id.
    }
}