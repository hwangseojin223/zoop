package com.zoop.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author hwangseojin
 */
@Service
public class FileStorageService {
    @Value("${file.upload.directory}")
    private String uploadDirectory;
    
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDirectory));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }
    
    public String storeFile(MultipartFile file) {
        // 원본 파일명
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        // 파일명 충돌 방지를 위한 고유 파일명 생성
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
        
        try {
            // 파일 저장
            Path targetLocation = Paths.get(uploadDirectory).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + fileName, e);
        }
    }
    
    // 파일 로드 메서드 추가
    public Path loadFile(String fileName) {
        return Paths.get(uploadDirectory).resolve(fileName);
    }
    
    // 파일 삭제 메서드 (필요시 사용)
    public boolean deleteFile(String fileName) {
        try {
            Path file = loadFile(fileName);
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Error deleting file: " + fileName, e);
        }
    }
}
