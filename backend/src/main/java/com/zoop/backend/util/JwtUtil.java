// ✅ JwtUtil.java - 사용자 ID와 유형을 클레임에 포함하여 JWT 생성 및 추출 기능 추가
package com.zoop.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // SignatureException 임포트
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap; // HashMap 임포트
import java.util.Map; // Map 임포트
import java.util.function.Function; // Function 임포트


@Component
public class JwtUtil {

    private final Key secretKey;
    // ✅ application.yml에서 설정한 만료 시간 주입 (밀리초 단위)
    // 하드코딩된 EXPIRATION_MS 상수를 사용하는 대신 설정 파일 값 사용
    @Value("${jwt.expiration}")
    private long expiration;

    // application.yml에서 시크릿 키를 주입받아 HMAC 키로 변환
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // ✅ Secret Key 길이 검증 (선택 사항이지만, 개발 단계에서 유용)
        // application.yml의 secret 값이 32바이트 미만이면 WeakKeyException 발생 가능
        if (keyBytes.length < 32) {
             System.err.println("⚠️ WARNING: JWT Secret Key length is less than 32 bytes (" + keyBytes.length * 8 + " bits). It should be at least 256 bits for HS256. Please update your application.yml.");
             // 필요시 throw new io.jsonwebtoken.security.WeakKeyException("JWT Secret Key is too short.");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // ✅ 사용자 ID 및 유형을 클레임에 포함하여 JWT 생성하는 새로운 메소드 (권장)
    // userId는 데이터베이스의 PK 타입(Long, Integer 등)에 따라 달라질 수 있으므로 String으로 받아 처리
    public String generateToken(String userId, String userType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId); // 'userId' 클레임에 사용자 고유 ID 추가
        claims.put("userType", userType); // 'userType' 클레임에 사용자 유형 추가
        // 필요하다면 loginId 등 다른 정보도 claims에 추가할 수 있습니다.

        return Jwts.builder()
                .setClaims(claims) // 사용자 정의 클레임 설정
                .setSubject(userId) // subject(토큰의 주체)는 사용자 ID로 설정하는 것이 일반적
                .setIssuedAt(new Date(System.currentTimeMillis())) // 토큰 발행 시간
                // ✅ application.yml에서 주입받은 만료 시간 사용
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // 토큰 만료 시간
                .signWith(secretKey, SignatureAlgorithm.HS256) // HS256 알고리즘으로 서명
                .compact(); // JWT 문자열 생성
    }


     // 기존 generateToken 메소드 (하위 호환성을 위해 유지하거나 삭제 가능)
     // 이 메소드로 생성된 토큰은 'userId', 'userType' 클레임이 없습니다.
    public String generateToken(String loginId) {
        // Map<String, Object> claims = new HashMap<>(); // 클레임 없이 subject만 설정할 경우 필요 없음
        return Jwts.builder()
                .setSubject(loginId) // subject에 loginId 설정
                .setIssuedAt(new Date(System.currentTimeMillis()))
                // ✅ application.yml에서 주입받은 만료 시간 사용
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey, SignatureAlgorithm.HS256) // 기본 알고리즘 (HS256) 사용
                .compact();
    }


    // 토큰에서 모든 클레임(페이로드) 추출 메소드
    // 토큰 파싱 및 검증 과정에서 발생하는 예외를 처리
    public Claims extractAllClaims(String token) {
         try {
             return Jwts.parserBuilder()
                     .setSigningKey(secretKey) // 서명 키 설정
                     .build() // JwtParserBuilder 빌드
                     .parseClaimsJws(token) // JWS (Signed JWT) 파싱 및 서명 검증
                     .getBody(); // 클레임(페이로드) 얻기
         } catch (ExpiredJwtException e) {
             // 토큰 만료 시 발생하는 예외
             System.err.println("JWT 토큰 만료: " + e.getMessage());
             throw new RuntimeException("JWT 토큰이 만료되었습니다.", e); // 예외 다시 던지기
         } catch (UnsupportedJwtException e) {
             // 지원되지 않는 JWT 형식
              System.err.println("지원되지 않는 JWT 형식: " + e.getMessage());
             throw new RuntimeException("지원되지 않는 JWT 토큰입니다.", e);
         } catch (MalformedJwtException e) {
             // 잘못 구성된 JWT (예: 형식이 잘못됨)
              System.err.println("잘못 구성된 JWT: " + e.getMessage());
             throw new RuntimeException("잘못 구성된 JWT 토큰입니다.", e);
         } catch (SignatureException e) {
             // 시그니처 검증 실패 (키가 다르거나 토큰이 변조됨)
              System.err.println("JWT 시그니처 검증 실패: " + e.getMessage());
             throw new RuntimeException("JWT 시그니처 검증에 실패했습니다.", e);
         } catch (IllegalArgumentException e) {
             // JWT 문자열이 비어 있거나 null 등 유효하지 않은 인자
              System.err.println("유효하지 않은 JWT 문자열: " + e.getMessage());
             throw new RuntimeException("JWT 문자열이 유효하지 않습니다.", e);
         }
    }

    // 특정 클레임 추출을 위한 제네릭 헬퍼 메소드
    // extractAllClaims를 호출하여 모든 클레임을 가져온 후 원하는 클레임만 추출
     public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
     }

    // ✅ 토큰에서 사용자 ID 추출 메소드
    // generateToken(String userId, String userType) 메소드로 생성된 토큰에서 "userId" 클레임 값을 가져옴
    public String extractUserId(String token) {
         // claims.get("userId", String.class)를 사용하여 "userId" 클레임의 값을 String 타입으로 가져옵니다.
         // generateToken에서 userId를 String으로 저장했으므로 여기서도 String으로 가져옵니다.
        return extractClaim(token, claims -> claims.get("userId", String.class)); // 클레임 키 "userId" 사용
    }

    // ✅ 토큰에서 사용자 유형 추출 메소드
    // generateToken(String userId, String userType) 메소드로 생성된 토큰에서 "userType" 클레임 값을 가져옴
    public String extractUserType(String token) {
         // claims.get("userType", String.class)를 사용하여 "userType" 클레임의 값을 String 타입으로 가져옵니다.
         return extractClaim(token, claims -> claims.get("userType", String.class)); // 클레임 키 "userType" 사용
    }


    // 토큰에서 subject 추출 메소드
     // 어떤 generateToken 메소드를 사용했는지에 따라 subject가 userId일 수도, loginId일 수도 있습니다.
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    // 토큰 만료일 추출 메소드
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 토큰 만료 여부 확인 메소드
    public Boolean isTokenExpired(String token) {
         try {
              return extractExpiration(token).before(new Date()); // 만료일이 현재 시간 이전인지 확인
         } catch (RuntimeException e) {
              // 만료일 추출 중 오류 발생 시 (예: 잘못된 토큰)
              System.err.println("토큰 만료 여부 확인 중 오류 발생: " + e.getMessage());
              return true; // 유효하지 않다고 판단 (만료된 것과 동일하게 처리)
         }
    }

    // ✅ 토큰 유효성 검증 메소드 (h님 원본 코드의 isTokenValid 개선)
    // 토큰 파싱 및 검증 과정에서 발생하는 예외를 통해 유효성을 판단하는 것이 더 안전합니다.
    public boolean isTokenValid(String token) {
        // 토큰 문자열 자체의 유효성 검사 (null, 빈 문자열)
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        try {
            // extractAllClaims 메소드 호출 시 서명 검증, 만료일 검증, 형식 검사 등 유효성 문제가 있으면 내부적으로 예외 발생
            extractAllClaims(token);
            return true; // 예외가 발생하지 않았다면 유효한 토큰
        } catch (RuntimeException e) {
            // extractAllClaims에서 이미 로깅을 수행했으므로 여기서는 추가 로깅 필요 없을 수 있음
            // System.err.println("Token validation failed: " + e.getMessage()); // 필요시 추가 로깅
            return false; // 예외 발생 시 유효하지 않음
        }
    }

    // 기존 getLoginIdFromToken 메소드 (h님 원본 코드 유지 - 하위 호환성 또는 특정 목적으로 사용)
    // 새로운 extractSubject 메소드 사용을 권장합니다.
     public String getLoginIdFromToken(String token) {
         // 주의: generateToken(String userId, String userType)로 생성된 토큰의 subject는 userId입니다.
         // 이 메소드는 generateToken(String loginId)으로 생성된 토큰에서 loginId(subject)를 가져올 때 유효합니다.
         return extractClaim(token, Claims::getSubject);
     }

    // TODO: refresh token 관련 로직 추가 고려
    // TODO: 스프링 시큐리티 UserDetails와 연동하여 사용자 정보 기반 유효성 검증 메소드 추가 고려
}
