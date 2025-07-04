# ZOOP Backend API Services

이 프로젝트는 ZOOP 채용 플랫폼의 백엔드 API 서비스들입니다.

## 서비스 구성

### 1. Chatbot API Service (Port 8000)
**위치**: `backend/python-api/chatbot/`
**기능**: 
- 일반 채팅봇 기능 (`/chat`)
- 인재상 작성 AI 어시스턴트 (`/ideal-candidate-chat`)

**실행 방법**:
```bash
cd backend/python-api/chatbot
pip install -r requirements.txt
uvicorn chatbot_api:app --host 0.0.0.0 --port 8000 --reload
```

### 2. GitHub Search API Service (Port 8081)
**위치**: `backend/python-api/github_search/`
**기능**: 
- GitHub 인재 검색 (`/search`)

**실행 방법**:
```bash
cd backend/python-api/github_search
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

## 환경 설정

### 필수 환경 변수
`.env` 파일을 각 서비스 디렉토리에 생성하고 다음 변수들을 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
PDF_PATH=채용_관리자_가이드.pdf  # chatbot 서비스용
OPENAI_MODEL=gpt-4o-mini
```

### 의존성 설치
각 서비스 디렉토리에서 다음 명령어를 실행하세요:

```bash
pip install fastapi uvicorn openai python-dotenv PyPDF2
```

## API 엔드포인트

### Chatbot Service (Port 8000)
- `POST /chat` - 일반 채팅봇
- `POST /ideal-candidate-chat` - 인재상 작성 AI

### GitHub Search Service (Port 8081)
- `POST /search` - GitHub 인재 검색

## 개발 가이드

### 서비스 구조
- **chatbot_api.py**: 채팅봇 및 인재상 작성 기능 담당
- **main.py**: GitHub 검색 기능만 담당 (중복 엔드포인트 제거됨)

### 프론트엔드 연결
- 프론트엔드는 `http://localhost:8000/ideal-candidate-chat`로 인재상 작성 요청
- GitHub 검색은 `http://localhost:8081/api/github-search`로 요청

## 문제 해결

### 포트 충돌
- 각 서비스가 다른 포트에서 실행되는지 확인
- `lsof -i :8000` 또는 `lsof -i :8081`로 포트 사용 확인

### API 키 오류
- `.env` 파일이 올바른 위치에 있는지 확인
- OpenAI API 키가 유효한지 확인

### 의존성 오류
- 각 서비스 디렉토리에서 `pip install -r requirements.txt` 실행
- Python 버전 호환성 확인 (Python 3.8+ 권장) 