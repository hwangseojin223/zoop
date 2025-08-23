# 🚀 ZOOP 무료 배포 가이드

## 📋 배포 개요
- **Frontend**: Vercel (무료)
- **Backend**: Railway (무료)
- **Database**: Railway PostgreSQL (무료)

## 🎯 1단계: Frontend 배포 (Vercel)

### 1.1 Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인

### 1.2 프로젝트 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 실행
cd frontend
vercel

# 또는 GitHub 연동으로 자동 배포
# 1. Vercel 대시보드에서 "New Project" 클릭
# 2. GitHub 저장소 선택
# 3. Root Directory: frontend 설정
# 4. Build Command: npm run build
# 5. Output Directory: build
```

### 1.3 환경변수 설정
Vercel 대시보드 → Settings → Environment Variables
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## 🎯 2단계: Backend 배포 (Railway)

### 2.1 Railway 계정 생성
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인

### 2.2 프로젝트 배포
```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd backend
railway init

# 배포
railway up
```

### 2.3 환경변수 설정
Railway 대시보드 → Variables 탭
```
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-url:5432/zoop
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
JWT_SECRET=your-jwt-secret
```

## 🎯 3단계: Database 설정 (Railway PostgreSQL)

### 3.1 PostgreSQL 서비스 생성
1. Railway 대시보드에서 "New Service" → "Database" → "PostgreSQL"
2. 서비스 이름: `zoop-database`

### 3.2 연결 정보 확인
Railway 대시보드 → PostgreSQL 서비스 → Connect 탭에서 연결 정보 확인

### 3.3 Backend와 연결
Backend 서비스의 환경변수에 PostgreSQL 연결 정보 설정

## 🎯 4단계: CORS 설정

### 4.1 Backend CORS 설정 수정
`backend/src/main/java/com/zoop/backend/config/AppConfig.java`에서:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 🎯 5단계: 최종 확인

### 5.1 Frontend URL 확인
- Vercel에서 제공하는 도메인 확인 (예: `https://zoop-frontend.vercel.app`)

### 5.2 Backend URL 확인
- Railway에서 제공하는 도메인 확인 (예: `https://zoop-backend.railway.app`)

### 5.3 API 연결 테스트
```bash
curl https://your-backend-url.railway.app/actuator/health
```

## 🔧 문제 해결

### Frontend 빌드 오류
```bash
cd frontend
npm install
npm run build
```

### Backend 배포 오류
```bash
cd backend
./mvnw clean package -DskipTests
```

### Database 연결 오류
- Railway PostgreSQL 연결 정보 재확인
- 환경변수 설정 확인

## 📊 무료 티어 제한

### Vercel
- 월 100GB 대역폭
- 월 100시간 서버리스 함수 실행
- 개인 프로젝트 무제한

### Railway
- 월 $5 크레딧 (무료 티어)
- 512MB RAM
- 1GB 디스크
- PostgreSQL 1GB

## 🎉 배포 완료!

배포가 완료되면 다음 URL들로 접속 가능:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API 문서**: `https://your-app.railway.app/swagger-ui.html`

## 📞 지원

문제가 발생하면:
1. Railway 로그 확인
2. Vercel 빌드 로그 확인
3. 환경변수 설정 재확인
4. CORS 설정 확인
