package com.zoop.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("파일 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.");
    }

    // JWT 토큰 만료 예외 처리
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<String> handleExpiredJwtException(ExpiredJwtException exc) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("JWT 토큰이 만료되었습니다.");
    }

    // JWT 토큰 형식 오류 예외 처리
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException exc) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("잘못된 JWT 토큰 형식입니다.");
    }

    // 지원되지 않는 JWT 예외 처리
    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<String> handleUnsupportedJwtException(UnsupportedJwtException exc) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("지원되지 않는 JWT 토큰입니다.");
    }

    // JWT 시그니처 검증 실패 예외 처리
    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<String> handleSignatureException(SignatureException exc) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("JWT 토큰 검증에 실패했습니다.");
    }

    // JWT 관련 RuntimeException 처리 (JwtUtil에서 발생하는 예외들)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleJwtRuntimeException(RuntimeException exc) {
        String message = exc.getMessage();
        if (message != null && message.contains("JWT")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(message);
        }
        // JWT 관련이 아닌 다른 RuntimeException은 기존 로직으로 처리
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류가 발생했습니다: " + exc.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception exc) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류가 발생했습니다: " + exc.getMessage());
    }
} 