# ZOOP - AI 기반 채용 플랫폼

<div align="center">
  <img src="frontend/public/logo_zoop.png" alt="ZOOP Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)
  [![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 🎯 프로젝트 개요

ZOOP는 AI 기술을 활용한 혁신적인 채용 플랫폼입니다. GitHub 분석, AI 면접, 포트폴리오 매칭 등 다양한 기능을 통해 구직자와 기업을 연결합니다.

### 핵심 가치
- 🤖 **AI 기반 매칭**: GitHub 활동 분석을 통한 정확한 인재 매칭
- 🎥 **AI 면접**: 실시간 AI 면접으로 효율적인 선발 프로세스
- 📊 **데이터 기반**: 객관적인 데이터를 통한 공정한 평가
- 🚀 **사용자 친화적**: 직관적이고 편리한 사용자 경험

## ✨ 주요 기능

### 👤 구직자 기능
- **GitHub 연동**: GitHub 활동 자동 분석 및 포트폴리오 생성
- **AI 면접**: 실시간 AI 면접 시스템 (TTS 지원)
- **맞춤 공고 추천**: AI 기반 개인화된 채용 공고 추천
- **포트폴리오 관리**: 프로젝트 및 경력 관리
- **면접 일정 관리**: 면접 일정 확인 및 관리

### 🏢 기업 기능
- **AI 면접 관리**: 면접 일정 및 결과 관리
- **후보자 분석**: GitHub 기반 후보자 능력 분석
- **채용 공고 관리**: 공고 등록 및 관리
- **면접 평가**: AI 면접 결과 분석 및 평가

### 🤖 AI 서비스
- **GitHub 분석**: 코드 활동, 기여도, 기술 스택 분석
- **면접 질문 생성**: 포지션별 맞춤 면접 질문 생성
- **면접 분석**: 답변 내용 분석 및 평가
- **포트폴리오 매칭**: 기업 요구사항과 포트폴리오 매칭

## 🛠 기술 스택

### Frontend
- **React 19.1.0** - 사용자 인터페이스
- **React Router** - 라우팅
- **CSS3** - 스타일링
- **Web Speech API** - TTS 기능
- **MediaRecorder API** - 면접 녹화

### Backend
- **Spring Boot 3.x** - REST API 서버
- **Spring Security** - 인증 및 권한 관리
- **Spring Data JPA** - 데이터베이스 접근
- **MySQL** - 메인 데이터베이스
- **JWT** - 토큰 기반 인증

### AI Services
- **Python 3.8+** - AI 서비스 개발
- **OpenAI GPT** - 자연어 처리
- **GitHub API** - GitHub 데이터 분석
- **FastAPI** - AI 서비스 API

### DevOps
- **Docker** - 컨테이너화
- **Maven** - Java 빌드 도구
- **npm** - Node.js 패키지 관리

## 📁 프로젝트 구조

```
zoop/
├── frontend/                 # React 프론트엔드
│   ├── public/              # 정적 파일
│   ├── src/
│   │   ├── components/      # 공통 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   │   ├── candidate/  # 구직자 페이지
│   │   │   ├── company/    # 기업 페이지
│   │   │   └── info/       # 정보 페이지
│   │   ├── context/        # React Context
│   │   ├── api/            # API 통신
│   │   └── utils/          # 유틸리티 함수
│   └── package.json
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/zoop/backend/
│   │       ├── controller/ # REST API 컨트롤러
│   │       ├── service/    # 비즈니스 로직
│   │       ├── repository/ # 데이터 접근 계층
│   │       ├── domain/     # 엔티티 및 DTO
│   │       └── config/     # 설정 클래스
│   ├── python-api/         # Python AI 서비스
│   │   ├── chatbot/        # 챗봇 서비스
│   │   ├── github_search/  # GitHub 분석 서비스
│   │   ├── interview_analysis/ # 면접 분석 서비스
│   │   ├── portfolio_matching/ # 포트폴리오 매칭
│   │   └── interview_questions/ # 면접 질문 생성
│   └── pom.xml
└── README.md
```

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+
- Java 17+
- Python 3.8+
- MySQL 8.0+
- Git

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/zoop.git
cd zoop
```

### 2. Frontend 설정
```bash
cd frontend
npm install
npm start
```
- Frontend 서버: http://localhost:3000

### 3. Backend 설정
```bash
cd backend
# MySQL 데이터베이스 설정
# application.properties 파일에서 데이터베이스 연결 정보 수정

# Spring Boot 실행
./mvnw spring-boot:run
```
- Backend 서버: http://localhost:8081

### 4. AI 서비스 설정
```bash
cd backend/python-api

# 각 AI 서비스 설치 및 실행
cd chatbot
pip install -r requirements.txt
python chatbot_api.py

cd ../github_search
pip install -r requirements.txt
python main.py

cd ../interview_analysis
pip install -r requirements.txt
python interview_analysis_api.py

cd ../portfolio_matching
pip install -r requirements.txt
python portfolio_matching_api.py

cd ../interview_questions
pip install -r requirements.txt
python interview_questions_api.py
```

### 5. 환경 변수 설정
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:8081
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# Backend (application.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/zoop
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 📚 API 문서

### 주요 API 엔드포인트

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/logout` - 로그아웃

#### 구직자
- `GET /api/candidates/{id}/job-postings` - 지원 공고 목록
- `POST /api/candidates/portfolio` - 포트폴리오 등록
- `GET /api/interviews/{id}` - 면접 정보 조회

#### 기업
- `POST /api/companies/posts` - 채용 공고 등록
- `GET /api/companies/{id}/candidates` - 지원자 목록
- `POST /api/interview-schedules` - 면접 일정 등록

#### AI 서비스
- `POST /api/github/analyze` - GitHub 분석
- `POST /api/interview/questions` - 면접 질문 생성
- `POST /api/interview/analyze` - 면접 답변 분석
- `POST /api/portfolio/match` - 포트폴리오 매칭

## 💻 개발 가이드

### 코드 컨벤션
- **Frontend**: ESLint + Prettier 사용
- **Backend**: Google Java Style Guide 준수
- **Python**: PEP 8 스타일 가이드 준수

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 커밋 메시지 규칙
```
type(scope): description

feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

## 🚀 배포

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t zoop-frontend ./frontend
docker build -t zoop-backend ./backend

# Docker Compose 실행
docker-compose up -d
```

### 클라우드 배포
- **Frontend**: Vercel, Netlify
- **Backend**: AWS EC2, Google Cloud Platform
- **Database**: AWS RDS, Google Cloud SQL

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **이메일**: support@zoop.com
- **GitHub Issues**: [이슈 등록](https://github.com/your-username/zoop/issues)
- **문서**: [Wiki](https://github.com/your-username/zoop/wiki)

## 🙏 감사의 말

- [React](https://reactjs.org/) - 프론트엔드 프레임워크
- [Spring Boot](https://spring.io/projects/spring-boot) - 백엔드 프레임워크
- [OpenAI](https://openai.com/) - AI 서비스
- [GitHub API](https://docs.github.com/en/rest) - GitHub 데이터 분석

---

<div align="center">
  <p>Made with ❤️ by ZOOP Team</p>
  <p>© 2024 ZOOP. All rights reserved.</p>
</div>