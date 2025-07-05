package com.zoop.backend.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucket;

    public S3Service(
        @Value("${cloud.aws.credentials.access-key}") String accessKey,
        @Value("${cloud.aws.credentials.secret-key}") String secretKey,
        @Value("${cloud.aws.region.static}") String region,
        @Value("${cloud.aws.s3.bucket}") String bucket
    ) {
        this.bucket = bucket;
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                    StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                    )
                )
                .build();
    }

    public String uploadPortfolioFile(MultipartFile file) throws IOException {
        String key = "portfolios/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        System.out.println("[S3Service] S3 업로드 시도: bucket=" + bucket + ", key=" + key + ", fileName=" + file.getOriginalFilename());
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build(),
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
            );
            System.out.println("[S3Service] S3 업로드 성공: " + key);
        } catch (Exception e) {
            System.err.println("[S3Service] S3 업로드 실패: " + e.getMessage());
            throw e;
        }
        
        // region을 포함한 올바른 S3 URL 생성
        String url = "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/" + key;
        System.out.println("[S3Service] S3 업로드 URL: " + url);
        System.out.println("[S3Service] 파일 크기: " + file.getSize() + " bytes");
        System.out.println("[S3Service] 파일 타입: " + file.getContentType());
        System.out.println("[S3Service] 파일명: " + file.getOriginalFilename());
        System.out.println("[S3Service] S3 키: " + key);
        return url;
    }

    public String uploadInterviewVideoFile(MultipartFile file) throws IOException {
        String key = "videos/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        System.out.println("[S3Service] S3 업로드 시도: bucket=" + bucket + ", key=" + key + ", fileName=" + file.getOriginalFilename());
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build(),
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
            );
            System.out.println("[S3Service] S3 업로드 성공: " + key);
        } catch (Exception e) {
            System.err.println("[S3Service] S3 업로드 실패: " + e.getMessage());
            throw e;
        }
        String url = "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/" + key;
        System.out.println("[S3Service] S3 업로드 URL: " + url);
        System.out.println("[S3Service] 파일 크기: " + file.getSize() + " bytes");
        System.out.println("[S3Service] 파일 타입: " + file.getContentType());
        System.out.println("[S3Service] 파일명: " + file.getOriginalFilename());
        System.out.println("[S3Service] S3 키: " + key);
        return url;
    }
} 